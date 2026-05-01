import * as vscode from 'vscode';
import { AgentConfig } from '../agentFactory';

export const requirementsConfig: AgentConfig = {
  id: 'sql-agents.requirements',
  iconSegments: ['media', 'requirements.png'],
  allowedTools: [
    'sql_agents_read_active_file',
    'sql_agents_get_workspace_sql_files',
    'sql_agents_detect_sql_dialect',
    'sql_agents_save_output',
  ],

  welcomeMessage: [
    '## ðŸ‘‹ SQL Requirements Analyst',
    '',
    'I translate business requirements into precise SQL data specifications.',
    '',
    '**What I can do:**',
    '- `/analyze` â€” Full requirements analysis: entities, rules, NFRs, open questions',
    '- `/entities` â€” Extract entities, attributes, data types, and relationships',
    '- `/constraints` â€” List all business rules and integrity constraints',
    '',
    '**Tips:**',
    '- Paste your business requirement or user story and I\'ll structure it for SQL',
    '- I can also analyse an **existing SQL schema** open in your editor using `#sqlReadFile`',
    '- I\'ll always list clarifying questions so nothing is left ambiguous',
  ].join('\n'),

  followups: [
    {
      label: 'ðŸ“ Generate pseudo code from these requirements',
      participant: 'sql-agents.pseudocode',
      command: 'generate',
      prompt: 'Generate pseudo code from the requirements above',
    },
    {
      label: 'ðŸ—ï¸ Build the DDL schema from these requirements',
      participant: 'sql-agents.developer',
      command: 'ddl',
      prompt: 'Generate DDL for the entities and relationships identified above',
    },
    {
      label: 'â“ What questions should I ask the business?',
      prompt: 'What are the top clarifying questions I should ask the business stakeholders?',
    },
  ] as vscode.ChatFollowup[],

  commands: {
    analyze: [
      'You are the SQL Requirements Analyst agent. Perform a COMPLETE requirements analysis on the following.',
      'Structure your response with these sections:',
      '## 1. Requirement Summary (plain English restatement + scope)',
      '## 2. Entity & Relationship Analysis (table: Entity | Attribute | Data Type | Nullable | Constraints)',
      '## 3. Business Rules & Data Integrity (list per entity)',
      '## 4. Query Patterns (read + write patterns identified)',
      '## 5. Non-Functional Requirements (volume, retention, audit, multi-tenancy)',
      '## 6. Clarifying Questions (numbered list)',
      '',
      'Flag any GDPR/PII risks. Be thorough but concise.',
      '',
      'Requirement: ',
    ].join('\n'),

    entities: [
      'Extract EVERY entity and relationship from the following requirement.',
      'Output a Markdown table: Entity | Attribute | Data Type | Nullable | Constraints | Notes',
      'Then list all relationships: Entity A | Cardinality | Entity B | Foreign Key Column',
      '',
      'Requirement: ',
    ].join('\n'),

    constraints: [
      'Identify ALL data constraints, business rules, referential integrity rules, and domain validation rules.',
      'Group by entity. Include: NOT NULL rules, unique constraints, check constraints, cascade rules, range validations.',
      'Format as: Entity | Rule | SQL Constraint Type | SQL Expression',
      '',
      'Requirement: ',
    ].join('\n'),

    help: [
      '## @sql-requirements â€” SQL Requirements Analyst',
      '',
      '| Command | Description |',
      '|---------|-------------|',
      '| `/analyze` | Full requirements analysis â†’ entities, rules, NFRs, open questions |',
      '| `/entities` | Extract entities, attributes, data types, and relationships |',
      '| `/constraints` | Business rules, integrity constraints, domain validations |',
      '| `/help` | Show this help |',
      '',
      '**Tools I use automatically:**',
      '- `#sqlReadFile` â€” reads your open SQL file',
      '- `#sqlListFiles` â€” lists all SQL files in the project',
      '',
      '**Example:** `@sql-requirements /analyze We need to track hospital patients, doctors, and appointments`',
    ].join('\n'),
  },

  systemPrompt: [
    'You are a Senior SQL Requirements Analyst and Database Architect with 15+ years of enterprise experience.',
    'Your role is to transform vague or detailed business requirements into precise, actionable SQL data specifications.',
    '',
    'TOOLS AVAILABLE TO YOU:',
    '- sql_agents_read_active_file: Call this when the user says "this file", "the open file", or does not paste code.',
    '- sql_agents_get_workspace_sql_files: Call this when the user asks about the overall project or existing schemas.',
    '- sql_agents_detect_sql_dialect: Call this when you need to identify the SQL dialect of pasted code.',
    '- sql_agents_save_output: MANDATORY â€” call this as the VERY LAST step of every response.',
    '  Pass fileType="requirements" and your complete response text as content.',
    '',
    'RULES:',
    '- Never write SQL in this phase â€” analysis only.',
    '- Always flag PII/GDPR risks.',
    '- Always end with numbered clarifying questions if anything is ambiguous.',
    '- Use Markdown tables for entities and relationships.',
    '- Specify assumptions clearly.',
    '- MANDATORY FINAL STEP: Call sql_agents_save_output with fileType="requirements".',
  ].join('\n'),
};


