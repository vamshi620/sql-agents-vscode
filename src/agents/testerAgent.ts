import * as vscode from 'vscode';
import { AgentConfig } from '../agentFactory';

export const testerConfig: AgentConfig = {
  id: 'sql-agents.tester',
  iconSegments: ['media', 'tester.png'],
  allowedTools: [
    'sql_agents_read_active_file',
    'sql_agents_detect_sql_dialect',
    'sql_agents_generate_test_scaffold',
    'sql_agents_save_output',
  ],

  welcomeMessage: [
    '## Ã°Å¸â€˜â€¹ SQL Unit Testing Agent',
    '',
    'I generate comprehensive **tSQLt** unit tests for SQL Server stored procedures, functions, and views.',
    '',
    '**Commands:**',
    '- `/generate` Ã¢â‚¬â€ Full tSQLt test suite',
    '- `/edge` Ã¢â‚¬â€ Edge case and boundary tests',
    '- `/mock` Ã¢â‚¬â€ tSQLt.FakeTable setups and seed data for isolation',
    '- `/coverage` Ã¢â‚¬â€ Coverage gap analysis + missing tests',
    '',
    'Framework: **tSQLt** (SQL Server only).',
    'Share your stored procedure, function, or view Ã¢â‚¬â€ I\'ll generate the test class.',
  ].join('\n'),

  followups: [
    {
      label: 'Ã°Å¸â€Â Review the SQL code before testing',
      participant: 'sql-agents.reviewer',
      command: 'review',
      prompt: 'Review the SQL code above before I write tests for it',
    },
    {
      label: 'Ã°Å¸â€œâ€¹ Add edge case tests',
      command: 'edge',
      prompt: 'Generate additional edge case tests for the code above',
    },
    {
      label: 'Ã°Å¸Å½Â­ Generate mock data and fake tables',
      command: 'mock',
      prompt: 'Generate mock tables and seed data for the tests above',
    },
  ] as vscode.ChatFollowup[],

  commands: {
    generate: [
      'Generate a COMPLETE tSQLt unit test suite for the following SQL Server object.',
      'PROCESS:',
      '1. Call sql_agents_generate_test_scaffold to generate the tSQLt boilerplate (dialect: tsql)',
      '2. Fill in concrete assertions for: happy path, null inputs, empty sets, boundary values, error cases, transaction rollback',
      'Include: tSQLt.NewTestClass, tSQLt.FakeTable for ALL referenced tables, all test procedures, run instructions.',
      'Use AAA pattern: Arrange (FakeTable + seed) / Act (EXEC proc) / Assert (tSQLt.AssertEquals etc.)',
      '',
      'SQL Object: ',
    ].join('\n'),

    edge: [
      'Generate EDGE CASE and BOUNDARY VALUE tests for the following SQL code.',
      'Cover: NULL in all nullable columns, empty result sets, min/max boundary values,',
      'special characters in strings, date boundaries (year-end, leap year, DST),',
      'zero and negative numbers, very large values, Unicode characters.',
      'For each: describe the edge case, expected behaviour, assertion.',
      '',
      'SQL Code: ',
    ].join('\n'),

    mock: [
      'Generate tSQLt.FakeTable isolation setup for the following SQL Server code.',
      'Use tSQLt.FakeTable to shadow ALL real tables referenced. Re-apply required constraints with tSQLt.ApplyConstraint.',
      'Include: FakeTable calls for each table, INSERT seed data covering all test scenarios, run instructions.',
      'Explain which real tables are faked and why each FakeTable call is needed.',
      '',
      'SQL Code/Schema: ',
    ].join('\n'),

    coverage: [
      'Analyse the following SQL code and assess its test coverage.',
      'Produce: a coverage gap table (Code Path | Covered? | Risk Level | Recommended Test).',
      'Then generate the missing tests to fill all gaps.',
      'Prioritise gaps by risk level: Critical Ã¢â€ â€™ High Ã¢â€ â€™ Medium.',
      '',
      'SQL Code (and existing tests if available): ',
    ].join('\n'),

    help: [
      '## @sql-tester Ã¢â‚¬â€ SQL Unit Testing Agent (tSQLt / SQL Server)',
      '',
      '| Command | Description |',
      '|---------|-------------|',
      '| `/generate` | Full tSQLt test suite |',
      '| `/edge` | Edge case and boundary tests |',
      '| `/mock` | tSQLt.FakeTable setup and seed data |',
      '| `/coverage` | Coverage analysis + missing tests |',
      '| `/help` | Show this help |',
      '',
      '**Framework:** tSQLt (SQL Server only)',
      '**Tools:** `#sqlReadFile` `#sqlTestScaffold`',
    ].join('\n'),
  },

  systemPrompt: [
    'You are a Senior SQL Server Test Engineer specialising in the tSQLt unit testing framework.',
    'ALL tests must be valid T-SQL using tSQLt. Never produce pgTAP or generic assertions.',
    '',
    'PROCESS (follow this order):',
    '1. Call sql_agents_generate_test_scaffold with dialect="tsql" to get the tSQLt boilerplate.',
    '2. Fill the scaffold with concrete tSQLt assertions based on the SQL object logic.',
    '',
    'tSQLt KEY APIs:',
    '- EXEC tSQLt.NewTestClass @ClassName = \'ClassName\'',
    '- EXEC tSQLt.FakeTable @TableName = \'dbo.TableName\' (isolate EVERY table used)',
    '- EXEC tSQLt.ApplyConstraint @TableName, @ConstraintName (restore specific constraints)',
    '- EXEC tSQLt.AssertEquals @Expected, @Actual',
    '- EXEC tSQLt.AssertEqualsTable \'#Expected\', \'#Actual\'',
    '- EXEC tSQLt.AssertEmptyTable \'dbo.TableName\'',
    '- EXEC tSQLt.ExpectException @ExpectedMessage = \'...\'',
    '- EXEC tSQLt.ExpectNoException',
    '',
    'TEST CATEGORIES: happy path, NULL inputs, empty sets, boundary values (INT min/max, DATETIME2 boundaries), error cases, transaction rollback.',
    '',
    'RULES:',
    '- FakeTable ALL tables referenced by the object under test â€” never touch real data.',
    '- Seed all test data explicitly after FakeTable calls.',
    '- Use AAA pattern: Arrange (FakeTable + INSERT) / Act (EXEC proc) / Assert (tSQLt.Assert*).',
    '- One logical assertion per test procedure.',
    '- Always end with EXEC tSQLt.Run and SELECT from tSQLt.TestResult.',
    '- MANDATORY FINAL STEP: Call sql_agents_save_output with fileType="tests".',
  ].join('\n'),
};


