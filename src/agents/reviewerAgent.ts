import * as vscode from 'vscode';
import { AgentConfig } from '../agentFactory';

export const reviewerConfig: AgentConfig = {
  id: 'sql-agents.reviewer',
  iconSegments: ['media', 'reviewer.png'],
  allowedTools: [
    'sql_agents_read_active_file',
    'sql_agents_detect_sql_dialect',
    'sql_agents_analyze_sql_quality',
    'sql_agents_save_output',
  ],

  welcomeMessage: [
    '## Ã°Å¸â€˜â€¹ SQL Code Reviewer',
    '',
    'I review SQL code for correctness, security, performance, and standards.',
    '',
    '**Commands:**',
    '- `/review` Ã¢â‚¬â€ Full review (Critical Ã¢â€ â€™ High Ã¢â€ â€™ Medium Ã¢â€ â€™ Low)',
    '- `/security` Ã¢â‚¬â€ SQL injection, permissions, PII exposure',
    '- `/performance` Ã¢â‚¬â€ Indexes, execution plans, N+1 patterns',
    '- `/standards` Ã¢â‚¬â€ Naming, formatting, SQL best practices',
    '',
    '**How I work:** I first run a static analyser on your code to find concrete issues, ',
    'then provide an LLM-powered semantic review. Open your file or paste code to begin.',
  ].join('\n'),

  followups: [
    {
      label: 'Ã°Å¸Â§Âª Generate tests for the reviewed code',
      participant: 'sql-agents.tester',
      command: 'generate',
      prompt: 'Generate unit tests covering the issues found in the code review above',
    },
    {
      label: 'Ã°Å¸â€â€™ Deep security audit',
      command: 'security',
      prompt: 'Perform a detailed security-focused review of the code above',
    },
    {
      label: 'Ã¢Å¡Â¡ Performance deep-dive',
      command: 'performance',
      prompt: 'Perform a detailed performance review of the code above',
    },
  ] as vscode.ChatFollowup[],

  commands: {
    review: [
      'Perform a FULL code review of the SQL code.',
      'The static analyser (sql_agents_analyze_sql_quality tool) will run first to provide concrete findings.',
      'Then provide your LLM-based semantic review.',
      'Structure:',
      '## Static Analysis Findings (from tool)',
      '## Semantic Review',
      '### Ã°Å¸â€Â´ Critical | Ã°Å¸Å¸Â  High | Ã°Å¸Å¸Â¡ Medium | Ã°Å¸Å¸Â¢ Low',
      'For each: Line ref | Issue | Risk | Fixed SQL snippet',
      '## Summary Table: counts per severity',
      '## Top 3 Priority Actions',
      '## Positive Observations',
      '',
      'SQL Code: ',
    ].join('\n'),

    security: [
      'Perform a SECURITY-FOCUSED review.',
      'Use sql_agents_analyze_sql_quality to detect injection patterns first.',
      'Then check: dynamic SQL without QUOTENAME, excessive permissions, PII columns exposed,',
      'missing parameterisation, privilege escalation, missing audit trails.',
      'For each finding: severity, location, attack scenario, remediation SQL.',
      '',
      'SQL Code: ',
    ].join('\n'),

    performance: [
      'Perform a PERFORMANCE-FOCUSED review.',
      'Check: missing indexes on JOIN/WHERE columns, Cartesian products, non-sargable predicates,',
      'implicit type conversions, cursor vs set-based, SELECT *, N+1, excessive temp table usage.',
      'Estimate impact for each issue. Provide optimised SQL.',
      '',
      'SQL Code: ',
    ].join('\n'),

    standards: [
      'Check the SQL code against coding standards and naming conventions.',
      'Evaluate: keyword casing, alias clarity, schema qualification, comment completeness,',
      'column list explicitness, formatting, deprecated syntax.',
      'Provide a compliance score 0-100 with breakdown by category.',
      '',
      'SQL Code: ',
    ].join('\n'),

    help: [
      '## @sql-reviewer Ã¢â‚¬â€ SQL Code Reviewer',
      '',
      '| Command | Description |',
      '|---------|-------------|',
      '| `/review` | Full review Ã¢â‚¬â€ all severity levels |',
      '| `/security` | Security: injection, permissions, PII |',
      '| `/performance` | Performance: indexes, plans, set-based |',
      '| `/standards` | Standards compliance score |',
      '| `/help` | Show this help |',
      '',
      '**Tools:** `#sqlReadFile` `#sqlDetectDialect` `#sqlAnalyzeQuality`',
      '',
      '**The `#sqlAnalyzeQuality` tool runs automatically** to give concrete line-level findings.',
    ].join('\n'),
  },

  systemPrompt: [
    'You are a Principal T-SQL Code Reviewer specialising in Microsoft SQL Server and Azure SQL.',
    'ALL code reviewed and ALL corrected code snippets must be valid T-SQL.',
    '',
    'REVIEW PROCESS (follow this order):',
    '1. FIRST call sql_agents_detect_sql_dialect. If not T-SQL, warn the user this agent is SQL Server only.',
    '2. THEN call sql_agents_analyze_sql_quality with dialect="tsql" to get concrete static analysis findings.',
    '3. THEN perform your semantic LLM review, referencing the tool findings as evidence.',
    '',
    'T-SQL SEVERITY LEVELS:',
    'Ã°Å¸â€Â´ Critical Ã¢â‚¬â€ SQL injection via EXEC(@sql), DELETE/UPDATE without WHERE, missing ROLLBACK',
    'Ã°Å¸Å¸Â  High Ã¢â‚¬â€ SELECT *, CURSOR/WHILE loops, non-sargable predicates, scalar UDFs in WHERE, missing FK indexes',
    'Ã°Å¸Å¸Â¡ Medium Ã¢â‚¬â€ NOLOCK as performance hack, RAISERROR instead of THROW, missing SET NOCOUNT ON, missing TRY/CATCH',
    'Ã°Å¸Å¸Â¢ Low Ã¢â‚¬â€ missing dbo. prefix, naming conventions, missing GO separator, deprecated *=join syntax',
    '',
    'RULES:',
    '- Always provide corrected T-SQL for every issue â€” never just describe the problem.',
    '- Be constructive. Acknowledge good patterns too.',
    '- Never suggest non-T-SQL syntax in your corrections.',
    '- MANDATORY FINAL STEP: Call sql_agents_save_output with fileType="review".',
  ].join('\n'),
};


