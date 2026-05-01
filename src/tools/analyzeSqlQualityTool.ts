import * as vscode from 'vscode';
import { IAnalyzeSqlQualityInput, SqlQualityFinding } from './toolInputs';

/**
 * Tool: sql_agents_analyze_sql_quality
 *
 * Static analysis of SQL code — detects common anti-patterns
 * and returns structured findings before the LLM generates review prose.
 *
 * This is a "grounding" tool: it gives the LLM concrete evidence-based data
 * rather than letting it hallucinate issues.
 */
export class AnalyzeSqlQualityTool
  implements vscode.LanguageModelTool<IAnalyzeSqlQualityInput>
{
  async prepareInvocation(
    _options: vscode.LanguageModelToolInvocationPrepareOptions<IAnalyzeSqlQualityInput>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    return {
      invocationMessage: 'Running SQL static analysis...',
      confirmationMessages: {
        title: 'Analyse SQL Code Quality',
        message: new vscode.MarkdownString(
          'Allow the SQL agent to perform static analysis on the provided SQL code to detect security issues, anti-patterns, and style violations?'
        ),
      },
    };
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IAnalyzeSqlQualityInput>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { sql_code, dialect = 'tsql' } = options.input;

    if (!sql_code || sql_code.trim().length === 0) {
      throw new Error(
        'No SQL code provided for analysis. Ask the user to provide the SQL code ' +
        'or use sql_agents_read_active_file to read the open file.'
      );
    }

    const findings: SqlQualityFinding[] = [];
    const lines = sql_code.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const upper = line.trim().toUpperCase();

      // ── CRITICAL: SQL Injection (dynamic SQL + concatenation) ─────────────
      if (
        (upper.includes('EXEC(') || upper.includes('SP_EXECUTESQL')) &&
        (line.includes("'") || line.includes('+'))
      ) {
        findings.push({
          severity: 'critical',
          line: lineNum,
          issueType: 'SQL Injection',
          description: `Line ${lineNum}: Dynamic SQL with potential string concatenation detected. If user input is concatenated directly, this is an SQL injection vulnerability.`,
          suggestion:
            'Use sp_executesql with parameterised inputs, or QUOTENAME() for object name injection.',
        });
      }

      // ── CRITICAL: UPDATE/DELETE without WHERE ─────────────────────────────
      if (upper.match(/^\s*(UPDATE|DELETE)\s+\w/) && !upper.includes('WHERE')) {
        // Check next few lines for WHERE
        const block = lines.slice(idx, idx + 10).join(' ').toUpperCase();
        if (!block.includes('WHERE')) {
          findings.push({
            severity: 'critical',
            line: lineNum,
            issueType: 'Missing WHERE Clause',
            description: `Line ${lineNum}: ${upper.startsWith('UPDATE') ? 'UPDATE' : 'DELETE'} statement with no WHERE clause detected — this will affect ALL rows.`,
            suggestion: 'Add a WHERE clause to restrict the operation to the intended rows.',
          });
        }
      }

      // ── HIGH: SELECT * ────────────────────────────────────────────────────
      if (upper.match(/SELECT\s+\*/)) {
        findings.push({
          severity: 'high',
          line: lineNum,
          issueType: 'SELECT *',
          description: `Line ${lineNum}: SELECT * returns all columns — breaks when schema changes and prevents covering index usage.`,
          suggestion: 'List explicit column names.',
        });
      }

      // ── HIGH: Hard-coded passwords / connection strings ───────────────────
      if (
        upper.match(/PASSWORD\s*=\s*['"]/) ||
        upper.match(/PWD\s*=\s*['"]/) ||
        upper.match(/CONNECTION.STRING/)
      ) {
        findings.push({
          severity: 'critical',
          line: lineNum,
          issueType: 'Hard-Coded Credential',
          description: `Line ${lineNum}: Potential hard-coded password or connection string detected.`,
          suggestion: 'Store credentials in a secret vault or environment variable, never in SQL code.',
        });
      }

      // ── MEDIUM: No schema qualification ───────────────────────────────────
      if (
        upper.match(/\b(FROM|JOIN|UPDATE|INSERT\s+INTO)\s+[A-Z_][A-Z0-9_]*\s/) &&
        !upper.match(/\b(FROM|JOIN|UPDATE|INSERT\s+INTO)\s+[A-Z_]+\.[A-Z_]/)
      ) {
        findings.push({
          severity: 'medium',
          line: lineNum,
          issueType: 'Missing Schema Qualification',
          description: `Line ${lineNum}: Table reference without schema qualifier. Without schema, SQL Server will use the user's default schema or perform an implicit search.`,
          suggestion: 'Use fully qualified names: dbo.TableName (T-SQL) or schema.table_name (PostgreSQL).',
        });
      }

      // ── MEDIUM: NOLOCK hints (T-SQL only) ────────────────────────────────
      if (dialect === 'tsql' && upper.includes('NOLOCK')) {
        findings.push({
          severity: 'medium',
          line: lineNum,
          issueType: 'NOLOCK Hint',
          description: `Line ${lineNum}: WITH(NOLOCK) can cause dirty reads and is frequently misused as a "performance hack".`,
          suggestion:
            'Consider READ COMMITTED SNAPSHOT ISOLATION (RCSI) at the database level instead.',
        });
      }

      // ── MEDIUM: Cursor usage ──────────────────────────────────────────────
      if (upper.match(/\bDECLARE\s+\w+\s+CURSOR\b/)) {
        findings.push({
          severity: 'medium',
          line: lineNum,
          issueType: 'Cursor Usage',
          description: `Line ${lineNum}: CURSOR detected. Row-by-row processing is significantly slower than set-based operations for large datasets.`,
          suggestion: 'Refactor to a set-based approach using JOINs, CTEs, or window functions.',
        });
      }

      // ── LOW: Missing alias clarity ────────────────────────────────────────
      if (upper.match(/\bAS\s+[A-Z]\b/)) {
        findings.push({
          severity: 'low',
          line: lineNum,
          issueType: 'Single-Letter Alias',
          description: `Line ${lineNum}: Single-letter alias detected. Aliases like 'a', 'b', 'c' reduce readability.`,
          suggestion: "Use meaningful abbreviations (e.g., 'c' for Customer → 'cust', 'o' for Order → 'ord').",
        });
      }
    });

    // ── Format findings as a structured report ────────────────────────────
    if (findings.length === 0) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          '✅ Static analysis complete. No issues detected by the automated checker. ' +
          'Proceed with an LLM-based review for deeper semantic analysis.'
        ),
      ]);
    }

    const criticalCount = findings.filter((f) => f.severity === 'critical').length;
    const highCount = findings.filter((f) => f.severity === 'high').length;
    const mediumCount = findings.filter((f) => f.severity === 'medium').length;
    const lowCount = findings.filter((f) => f.severity === 'low').length;

    const summary =
      `Static Analysis Complete — ${findings.length} issue(s) found:\n` +
      `🔴 Critical: ${criticalCount} | 🟠 High: ${highCount} | 🟡 Medium: ${mediumCount} | 🟢 Low: ${lowCount}\n\n` +
      `Findings (JSON):\n${JSON.stringify(findings, null, 2)}`;

    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(summary),
    ]);
  }
}
