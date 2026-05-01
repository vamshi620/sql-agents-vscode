/**
 * SQL Agents — Tool Input Interfaces
 *
 * These interfaces are validated at runtime against the JSON schemas declared
 * in package.json `contributes.languageModelTools[*].inputSchema`.
 */

export interface IReadActiveFileInput {
  startLine?: number;
  endLine?: number;
}

export interface IGetWorkspaceSqlFilesInput {
  includePattern?: string;
}

export interface IAnalyzeSqlQualityInput {
  sql_code: string;
  dialect?: 'tsql' | 'postgresql' | 'mysql' | 'ansi';
}

export interface IDetectSqlDialectInput {
  sql_code: string;
}

export interface IGenerateTestScaffoldInput {
  object_name: string;
  dialect: 'tsql' | 'postgresql' | 'generic';
  test_count?: number;
}

/** Structured finding returned by the SQL quality analyser */
export interface SqlQualityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  line?: number;
  issueType: string;
  description: string;
  suggestion: string;
}
