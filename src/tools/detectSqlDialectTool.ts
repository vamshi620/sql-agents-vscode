import * as vscode from 'vscode';
import { IDetectSqlDialectInput } from './toolInputs';

/**
 * Tool: sql_agents_detect_sql_dialect
 *
 * Detects the SQL dialect from a code snippet.
 * Private tool (canBeReferencedInPrompt: false) — used by agents internally
 * to tailor their output without the user having to specify the dialect.
 */
export class DetectSqlDialectTool
  implements vscode.LanguageModelTool<IDetectSqlDialectInput>
{
  // No confirmation needed for a read-only detection tool
  async prepareInvocation(
    _options: vscode.LanguageModelToolInvocationPrepareOptions<IDetectSqlDialectInput>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    return { invocationMessage: 'Detecting SQL dialect...' };
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IDetectSqlDialectInput>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { sql_code } = options.input;
    if (!sql_code || sql_code.trim().length === 0) {
      throw new Error('No SQL code provided for dialect detection.');
    }

    const upper = sql_code.toUpperCase();

    interface DialectSignal {
      dialect: 'tsql' | 'postgresql' | 'mysql' | 'oracle' | 'ansi';
      score: number;
      indicators: string[];
    }

    const signals: DialectSignal[] = [
      {
        dialect: 'tsql',
        score: 0,
        indicators: [],
      },
      {
        dialect: 'postgresql',
        score: 0,
        indicators: [],
      },
      {
        dialect: 'mysql',
        score: 0,
        indicators: [],
      },
      {
        dialect: 'oracle',
        score: 0,
        indicators: [],
      },
    ];

    const tsql = signals[0];
    const pg = signals[1];
    const mysql = signals[2];
    const oracle = signals[3];

    // T-SQL signals
    if (upper.includes('NVARCHAR'))   { tsql.score += 3; tsql.indicators.push('NVARCHAR type'); }
    if (upper.includes('GETDATE()'))  { tsql.score += 3; tsql.indicators.push('GETDATE()'); }
    if (upper.includes('TOP '))       { tsql.score += 2; tsql.indicators.push('TOP clause'); }
    if (upper.includes('NOLOCK'))     { tsql.score += 3; tsql.indicators.push('NOLOCK hint'); }
    if (upper.includes('GO\n') || upper.endsWith('GO')) { tsql.score += 2; tsql.indicators.push('GO batch separator'); }
    if (upper.includes('BEGIN TRY'))  { tsql.score += 3; tsql.indicators.push('TRY/CATCH'); }
    if (upper.includes('EXEC '))      { tsql.score += 1; tsql.indicators.push('EXEC keyword'); }
    if (upper.includes('ISNULL('))    { tsql.score += 2; tsql.indicators.push('ISNULL()'); }
    if (upper.includes('DATEADD('))   { tsql.score += 2; tsql.indicators.push('DATEADD()'); }
    if (upper.includes('['))          { tsql.score += 1; tsql.indicators.push('bracket identifier quoting'); }

    // PostgreSQL signals
    if (upper.includes('RETURNING'))         { pg.score += 3; pg.indicators.push('RETURNING clause'); }
    if (upper.includes('::'))                { pg.score += 3; pg.indicators.push(':: type cast'); }
    if (upper.includes('SERIAL') || upper.includes('BIGSERIAL')) { pg.score += 3; pg.indicators.push('SERIAL type'); }
    if (upper.includes('JSONB') || upper.includes('JSONB_')) { pg.score += 3; pg.indicators.push('JSONB type'); }
    if (upper.includes('NOW()'))             { pg.score += 2; pg.indicators.push('NOW()'); }
    if (upper.includes('COALESCE('))         { pg.score += 1; pg.indicators.push('COALESCE()'); }
    if (upper.includes('$$'))                { pg.score += 3; pg.indicators.push('$$ dollar quoting'); }
    if (upper.includes('PLPGSQL'))           { pg.score += 3; pg.indicators.push('PL/pgSQL'); }

    // MySQL signals
    if (upper.includes('ENGINE='))           { mysql.score += 3; mysql.indicators.push('ENGINE= clause'); }
    if (upper.includes('AUTO_INCREMENT'))    { mysql.score += 3; mysql.indicators.push('AUTO_INCREMENT'); }
    if (upper.includes('BACKTICK') || sql_code.includes('`')) { mysql.score += 2; mysql.indicators.push('backtick identifiers'); }
    if (upper.includes('TINYINT') || upper.includes('MEDIUMTEXT')) { mysql.score += 2; mysql.indicators.push('MySQL-specific types'); }
    if (upper.includes('NOW()'))             { mysql.score += 1; mysql.indicators.push('NOW()'); }

    // Oracle signals
    if (upper.includes('DUAL'))              { oracle.score += 3; oracle.indicators.push('DUAL table'); }
    if (upper.includes('ROWNUM'))            { oracle.score += 3; oracle.indicators.push('ROWNUM'); }
    if (upper.includes('VARCHAR2'))          { oracle.score += 3; oracle.indicators.push('VARCHAR2 type'); }
    if (upper.includes('NVL('))              { oracle.score += 3; oracle.indicators.push('NVL()'); }
    if (upper.includes('DBMS_'))             { oracle.score += 3; oracle.indicators.push('DBMS_ package'); }

    const best = signals.reduce((prev, curr) =>
      curr.score > prev.score ? curr : prev
    );

    const total = signals.reduce((sum, s) => sum + s.score, 0);
    const confidence = total === 0 ? 0 : Math.min(1, best.score / total);

    const resultDialect = best.score === 0 ? 'ansi' : best.dialect;

    const result = JSON.stringify(
      {
        dialect: resultDialect,
        confidence: parseFloat(confidence.toFixed(2)),
        indicators: best.indicators,
        allScores: {
          tsql: tsql.score,
          postgresql: pg.score,
          mysql: mysql.score,
          oracle: oracle.score,
        },
      },
      null,
      2
    );

    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(result),
    ]);
  }
}
