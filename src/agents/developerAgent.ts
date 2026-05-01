import * as vscode from 'vscode';
import { AgentConfig } from '../agentFactory';

export const developerConfig: AgentConfig = {
  id: 'sql-agents.developer',
  iconSegments: ['media', 'developer.png'],
  allowedTools: [
    'sql_agents_read_active_file',
    'sql_agents_get_workspace_sql_files',
    'sql_agents_detect_sql_dialect',
    'sql_agents_save_output',
  ],

  welcomeMessage: [
    '## ðŸ‘‹ SQL Code Developer',
    '',
    'I generate production-ready, performance-optimised, secure SQL code.',
    '',
    '**Commands:**',
    '- `/ddl` â€” CREATE TABLE, constraints, indexes',
    '- `/dml` â€” SELECT, INSERT, UPDATE, DELETE',
    '- `/procedure` â€” Stored procedures with TRY/CATCH',
    '- `/view` â€” View definitions',
    '- `/index` â€” Index recommendations for slow queries',
    '',
    'I auto-detect your SQL dialect (T-SQL/PostgreSQL/MySQL) from the code you provide.',
    'Open a file and use `#sqlReadFile` so I can see it, or paste code directly.',
  ].join('\n'),

  followups: [
    {
      label: 'ðŸ” Review this code for issues',
      participant: 'sql-agents.reviewer',
      command: 'review',
      prompt: 'Review the SQL code generated above for quality, security, and performance issues',
    },
    {
      label: 'ðŸ§ª Generate unit tests for this code',
      participant: 'sql-agents.tester',
      command: 'generate',
      prompt: 'Generate a unit test suite for the SQL code generated above',
    },
    {
      label: 'âš¡ Recommend indexes for this query',
      command: 'index',
      prompt: 'Recommend optimal indexes for the query generated above',
    },
  ] as vscode.ChatFollowup[],

  commands: {
    ddl: [
      'Generate production-ready DDL (CREATE TABLE / schema statements) for the following requirement.',
      'Include: primary keys, foreign keys, UNIQUE, CHECK, DEFAULT, NOT NULL constraints.',
      'Add covering indexes for the expected read patterns.',
      'Add a header comment block (purpose, author, date).',
      'Specify the SQL dialect. Use schema-qualified names.',
      '',
      'Requirement: ',
    ].join('\n'),

    dml: [
      'Generate production-ready DML statements (SELECT/INSERT/UPDATE/DELETE) for the following.',
      'Rules: explicit column lists, meaningful aliases, parameterised inputs, appropriate WHERE clauses,',
      'ORDER BY, pagination (OFFSET/FETCH or LIMIT), NULL handling, schema-qualified names.',
      'Explain what the SQL does in 2-3 sentences after the code block.',
      '',
      'Requirement: ',
    ].join('\n'),

    procedure: [
      'Generate a complete, production-ready stored procedure for the following requirement.',
      'Must include: header comment block, input parameters with types and defaults,',
      'input validation, TRY/CATCH, BEGIN TRAN/COMMIT/ROLLBACK, meaningful RAISERROR messages,',
      'audit logging (if appropriate), and RETURN value or result set.',
      'Use schema-qualified names. Parameterise all inputs.',
      '',
      'Requirement: ',
    ].join('\n'),

    view: [
      'Generate a complete view definition for the following requirement.',
      'Include: header comment block, explicit column aliases, schema-qualified names,',
      'a comment on intended use, and note if the view should be indexed (materialised).',
      '',
      'Requirement: ',
    ].join('\n'),

    index: [
      'Analyse the following query/schema and recommend the optimal indexing strategy.',
      'For each index: CREATE INDEX statement, why it helps (covering/composite/filtered),',
      'estimated selectivity, and write-overhead trade-off.',
      'Order recommendations by impact: Critical â†’ High â†’ Nice-to-Have.',
      '',
      'Query/Schema: ',
    ].join('\n'),

    help: [
      '## @sql-developer â€” SQL Code Developer',
      '',
      '| Command | Description |',
      '|---------|-------------|',
      '| `/ddl` | CREATE TABLE DDL with constraints and indexes |',
      '| `/dml` | SELECT / INSERT / UPDATE / DELETE |',
      '| `/procedure` | Stored procedure with full error handling |',
      '| `/view` | View definition |',
      '| `/index` | Index recommendations |',
      '| `/help` | Show this help |',
      '',
      '**Tools:** `#sqlReadFile` `#sqlListFiles` `#sqlDetectDialect`',
    ].join('\n'),
  },

  systemPrompt: [
    'You are a Senior T-SQL Developer and SQL Server Database Engineer (SQL Server 2016+ / Azure SQL).',
    'ALL output must be valid T-SQL. Never produce PostgreSQL, MySQL, Oracle, or generic SQL.',
    '',
    'CODE QUALITY STANDARDS:',
    '- UPPERCASE SQL keywords. One clause per line.',
    '- Meaningful table aliases (not a/b/c). dbo. schema-qualified names.',
    '- Explicit column lists â€” never SELECT *.',
    '- @Param style parameters. No dynamic SQL string concatenation.',
    '- TRY/CATCH + BEGIN TRANSACTION/COMMIT/ROLLBACK in every stored procedure.',
    '- SET NOCOUNT ON and SET XACT_ABORT ON at the top of every procedure.',
    '- THROW for errors (not RAISERROR). CREATE OR ALTER PROCEDURE (not DROP+CREATE).',
    '- GO batch separator after every DDL object.',
    '',
    'TOOLS:',
    '- sql_agents_read_active_file: Use when user references an open file.',
    '- sql_agents_get_workspace_sql_files: Use when asked about the project.',
    '- sql_agents_detect_sql_dialect: Validate dialect is T-SQL; warn user if it is not.',
    '- sql_agents_save_output: MANDATORY â€” call as the VERY LAST step.',
    '  For DDL output: fileType="ddl". For procedures/queries/views: fileType="code".',
    '  If both DDL and code are produced, call this tool TWICE (once per type).',
    '',
    'Always confirm: \'Target: SQL Server [version] / Azure SQL\'.',
    'After each code block: 2-3 sentence explanation + SQL Server version requirements + gotchas.',
    'MANDATORY FINAL STEP: Call sql_agents_save_output.',
  ].join('\n'),
};


