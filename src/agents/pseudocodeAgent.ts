import * as vscode from 'vscode';
import { AgentConfig } from '../agentFactory';

export const pseudocodeConfig: AgentConfig = {
  id: 'sql-agents.pseudocode',
  iconSegments: ['media', 'pseudocode.png'],
  allowedTools: [
    'sql_agents_read_active_file',
    'sql_agents_detect_sql_dialect',
    'sql_agents_save_output',
  ],

  welcomeMessage: [
    '## 👋 SQL Pseudo Code Developer',
    '',
    'I design SQL query logic and algorithms in plain English **before** any SQL is written.',
    '',
    '**Commands:**',
    '- `/generate` — Step-by-step pseudo code from a requirement',
    '- `/flowchart` — Data flow diagram (sources → filters → joins → output)',
    '- `/optimize` — Algorithm-level optimisation suggestions',
    '',
    'Send me a requirement, a description, or paste the business rule — I\'ll design the logic first.',
  ].join('\n'),

  followups: [
    {
      label: '💻 Write the actual SQL code from this pseudo code',
      participant: 'sql-agents.developer',
      command: 'dml',
      prompt: 'Generate production SQL code implementing the pseudo code logic above',
    },
    {
      label: '🔎 Review the logic for performance issues',
      prompt: 'Are there any performance anti-patterns in this logic? Suggest set-based alternatives.',
    },
    {
      label: '🏗️ Generate the DDL schema needed for this query',
      participant: 'sql-agents.developer',
      command: 'ddl',
      prompt: 'Generate the DDL tables and indexes needed to support this query logic',
    },
  ] as vscode.ChatFollowup[],

  commands: {
    generate: [
      'Generate structured SQL pseudo code for the following requirement.',
      'Format:',
      'QUERY/PROCEDURE name(parameters)',
      '  INPUT: [describe parameters]',
      '  OUTPUT: [describe result set]',
      '  STEP 1: [action] — details',
      '  DECISION: IF [condition] THEN ... ELSE ...',
      '  LOOP: FOR EACH ... [with stop condition]',
      '  RETURN: [what is returned]',
      '',
      'Also include: Edge Cases, NULL Handling, Performance Notes.',
      'Write pseudo code ONLY — no actual SQL syntax.',
      '',
      'Requirement: ',
    ].join('\n'),

    flowchart: [
      'Describe the following SQL logic as a data flow diagram using arrows (→).',
      'Show: Data Sources → Filters → Joins → Aggregations → Transformations → Output.',
      'Highlight branching conditions (IF/ELSE) and loops.',
      'Use plain text ASCII art or Mermaid flowchart syntax.',
      '',
      'Query/Requirement: ',
    ].join('\n'),

    optimize: [
      'At the pseudo code / algorithm level (before writing SQL), suggest optimisation strategies.',
      'Address: set-based vs cursor/loop, index candidates, CTE vs subquery vs temp table,',
      'pagination strategy, batch sizing, and parallelism opportunities.',
      'Provide before/after pseudo code for each optimisation.',
      '',
      'Logic/Requirement: ',
    ].join('\n'),

    help: [
      '## @sql-pseudocode — SQL Pseudo Code Developer',
      '',
      '| Command | Description |',
      '|---------|-------------|',
      '| `/generate` | Step-by-step pseudo code from a requirement |',
      '| `/flowchart` | Text data flow diagram |',
      '| `/optimize` | Algorithm-level optimisation |',
      '| `/help` | Show this help |',
      '',
      '**Example:** `@sql-pseudocode /generate Find top 10 customers by revenue in the last 90 days`',
    ].join('\n'),
  },

  systemPrompt: [
    'You are a Senior SQL Server Architect and Algorithm Designer.',
    'You produce clear, technology-agnostic pseudo code for SQL Server operations BEFORE any T-SQL is written.',
    '',
    'TOOLS:',
    '- sql_agents_read_active_file: Use when user says "this file" or "the open query".',
    '- sql_agents_detect_sql_dialect: Use if the user pastes SQL snippets for context.',
    '- sql_agents_save_output: MANDATORY — call as the VERY LAST step. Pass fileType="pseudocode" and full response as content.',
    '',
    'RULES:',
    '- Write pseudo code ONLY — never actual SQL syntax.',
    '- Use action verbs: GET, FILTER, JOIN, GROUP, AGGREGATE, SORT, RETURN.',
    '- Every LOOP must have a stop condition.',
    '- Always call out NULL checks.',
    '- Flag set-based vs row-based trade-offs (SQL Server: avoid CURSOR/WHILE if set-based is possible).',
    '- MANDATORY FINAL STEP: Call sql_agents_save_output with fileType="pseudocode".',
  ].join('\n'),
};
