/**
 * SQL Agents VS Code Extension — Entry Point (April 2026 Pattern)
 *
 * Registers:
 *  - 5 x ChatParticipant (one per SQL lifecycle stage)
 *  - 5 x LanguageModelTool (workspace introspection + static analysis)
 */
import * as vscode from 'vscode';

// ── Agent factory & configs ──────────────────────────────────────────────────
import { createSqlAgent }          from './agentFactory';
import { requirementsConfig }      from './agents/requirementsAgent';
import { pseudocodeConfig }        from './agents/pseudocodeAgent';
import { developerConfig }         from './agents/developerAgent';
import { reviewerConfig }          from './agents/reviewerAgent';
import { testerConfig }            from './agents/testerAgent';

// ── Tool implementations ─────────────────────────────────────────────────────
import { ReadActiveFileTool }        from './tools/readActiveFileTool';
import { GetWorkspaceSqlFilesTool }  from './tools/getWorkspaceSqlFilesTool';
import { AnalyzeSqlQualityTool }     from './tools/analyzeSqlQualityTool';
import { DetectSqlDialectTool }      from './tools/detectSqlDialectTool';
import { GenerateTestScaffoldTool }  from './tools/generateTestScaffoldTool';
import { SaveOutputTool }            from './tools/saveOutputTool';

export function activate(context: vscode.ExtensionContext): void {

  // ── 1. Register LanguageModelTools (2026 pattern) ─────────────────────────
  //    Tools are first-class citizens in agent mode — the LLM decides when to
  //    call them based on their modelDescription in package.json.

  context.subscriptions.push(
    vscode.lm.registerTool(
      'sql_agents_read_active_file',
      new ReadActiveFileTool()
    ),
    vscode.lm.registerTool(
      'sql_agents_get_workspace_sql_files',
      new GetWorkspaceSqlFilesTool()
    ),
    vscode.lm.registerTool(
      'sql_agents_analyze_sql_quality',
      new AnalyzeSqlQualityTool()
    ),
    vscode.lm.registerTool(
      'sql_agents_detect_sql_dialect',
      new DetectSqlDialectTool()
    ),
    vscode.lm.registerTool(
      'sql_agents_generate_test_scaffold',
      new GenerateTestScaffoldTool()
    ),
    vscode.lm.registerTool(
      'sql_agents_save_output',
      new SaveOutputTool()
    )
  );

  // ── 2. Register ChatParticipants (2026 pattern) ───────────────────────────
  //    Each participant gets a welcomeMessageProvider, followupProvider,
  //    and an agentic tool-calling loop in its handler.

  createSqlAgent(requirementsConfig, context);
  createSqlAgent(pseudocodeConfig,   context);
  createSqlAgent(developerConfig,    context);
  createSqlAgent(reviewerConfig,     context);
  createSqlAgent(testerConfig,       context);

  console.log(
    '✅ SQL Agents v2.0 activated — 5 agents + 6 tools ready (April 2026 pattern)'
  );
}

export function deactivate(): void {
  // VS Code disposes all context.subscriptions automatically
}
