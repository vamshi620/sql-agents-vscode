# 🤖 SQL Agents v2.0 — Custom GitHub Copilot Agents (April 2026 Pattern)

Five custom GitHub Copilot agents built with the **April 2026 VS Code Agentic API**:
`ChatParticipant` + `LanguageModelTool` + multi-turn tool-calling loop.

---

## What's New in v2.0 (2026 Pattern)

| Feature | v1.0 (Old) | v2.0 (2026 Pattern) |
|---------|-----------|---------------------|
| Architecture | Chat participants only | Chat participants + LanguageModelTools |
| Tool calling | Manual prompt construction | Agentic loop: LLM decides when to call tools |
| Code reading | User must paste code | `sql_agents_read_active_file` tool auto-reads open file |
| Code review | LLM guesses at issues | `sql_agents_analyze_sql_quality` provides real findings |
| Dialect detection | User must specify | `sql_agents_detect_sql_dialect` auto-detects from code |
| Test generation | LLM invents framework syntax | `sql_agents_generate_test_scaffold` generates correct boilerplate |
| Follow-ups | None | `followupProvider` suggests next-step actions after every reply |
| VS Code Engine | 1.90 | **1.99+** |

---

## The 5 Agents

| Agent | `@` Handle | Key Auto-Used Tools |
|-------|-----------|---------------------|
| **Requirements Analyst** | `@sql-requirements` | `sqlReadFile`, `sqlListFiles`, `sqlDetectDialect` |
| **Pseudo Code Developer** | `@sql-pseudocode` | `sqlReadFile`, `sqlDetectDialect` |
| **Code Developer** | `@sql-developer` | `sqlReadFile`, `sqlListFiles`, `sqlDetectDialect` |
| **Code Reviewer** | `@sql-reviewer` | `sqlReadFile`, `sqlDetectDialect`, **`sqlAnalyzeQuality`** |
| **Unit Testing Agent** | `@sql-tester` | `sqlReadFile`, `sqlDetectDialect`, **`sqlTestScaffold`** |

## The 5 Tools (usable by all agents + directly in agent mode)

| Tool | `#` Reference | What It Does |
|------|--------------|--------------|
| `sql_agents_read_active_file` | `#sqlReadFile` | Reads the open SQL file from the editor |
| `sql_agents_get_workspace_sql_files` | `#sqlListFiles` | Lists all `.sql/.ddl` files in the project |
| `sql_agents_analyze_sql_quality` | `#sqlAnalyzeQuality` | Static analysis: injection, missing WHERE, SELECT *, cursors |
| `sql_agents_detect_sql_dialect` | _(internal)_ | Auto-detects T-SQL vs PostgreSQL vs MySQL |
| `sql_agents_generate_test_scaffold` | `#sqlTestScaffold` | Generates tSQLt / pgTAP / generic test boilerplate |

---

## Architecture (April 2026 Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│                      VS Code Copilot Chat                    │
│                                                             │
│  User: @sql-reviewer /review                                 │
│         └─► ChatParticipant handler (agentFactory.ts)        │
│               │                                              │
│               ├─1. Build messages + tool schemas             │
│               ├─2. Send to LLM (gpt-4o via vscode.lm)        │
│               │    LLM responds: "call sql_analyze_quality"   │
│               ├─3. vscode.lm.invokeTool()  ← LanguageModelTool│
│               │    Tool runs static analysis → returns JSON   │
│               ├─4. Inject tool result into message history    │
│               ├─5. Send to LLM again → generates review prose │
│               └─6. Stream markdown to user                   │
│                    + followupProvider suggests next steps     │
└─────────────────────────────────────────────────────────────┘
```

### Key 2026 API Calls Used

```typescript
// Register a tool (new in stable API)
vscode.lm.registerTool('sql_agents_analyze_sql_quality', new AnalyzeSqlQualityTool());

// Tool class with prepareInvocation + invoke
class AnalyzeSqlQualityTool implements vscode.LanguageModelTool<IInput> {
  async prepareInvocation(options, token) { /* confirmation UI */ }
  async invoke(options, token) {
    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('...')]);
  }
}

// Tool-calling loop in handler
const toolCall: vscode.LanguageModelToolCallPart = /* from LLM stream */;
const result = await vscode.lm.invokeTool(toolCall.name, { input: toolCall.input, toolInvocationToken }, token);
messages.push(vscode.LanguageModelChatMessage.User([
  new vscode.LanguageModelToolResultPart(toolCall.callId, result.content)
]));

// Follow-ups after each response
participant.followupProvider = {
  provideFollowups(_result, _context, _token) { return config.followups; }
};
```

---

## Getting Started

### Prerequisites
- VS Code **1.99+** (required for stable `LanguageModelTool` API)
- **GitHub Copilot Chat** extension, signed in
- Node.js 18+

### Run in Development (F5)

```bash
# Install dependencies (already done)
npm install

# Compile TypeScript
npm run compile

# Press F5 in VS Code → Extension Development Host opens
# Open Copilot Chat (Ctrl+Alt+I), type @sql- to see all agents
```

### Package as .vsix

```bash
npm run package
code --install-extension sql-agents-2.0.0.vsix
```

---

## Usage Examples

### Example 1 — Reviewer auto-uses tools
```
@sql-reviewer /review

-- My procedure: 
DECLARE @sql NVARCHAR(MAX) = 'SELECT * FROM Users WHERE Name=''' + @name + ''''
EXEC(@sql)
```
**What happens:**
1. Agent calls `sql_agents_detect_sql_dialect` → detects T-SQL
2. Agent calls `sql_agents_analyze_sql_quality` → finds SQL injection + SELECT *
3. LLM generates review with concrete line numbers from the tool
4. Followup buttons appear: "Generate tests" | "Deep security audit"

### Example 2 — Read the open file
```
@sql-reviewer /review the stored procedure I have open
```
**What happens:**
1. Agent calls `sql_agents_read_active_file` → reads `usp_TransferFunds.sql`
2. Tool returns file content + path + line count
3. Full review proceeds on the actual file content

### Example 3 — Tester generates correct framework
```
@sql-tester /generate
CREATE PROCEDURE dbo.usp_TransferFunds ...
```
**What happens:**
1. Agent calls `sql_agents_detect_sql_dialect` → T-SQL
2. Agent calls `sql_agents_generate_test_scaffold` → returns tSQLt boilerplate
3. LLM fills in the test assertions for happy path, edge cases, error scenarios
4. Followup: "Add edge case tests" | "Generate mock data"

---

## Project Structure

```
src/
├── extension.ts              ← Registers tools first, then participants
├── agentFactory.ts           ← Factory: tool-calling loop + followupProvider
├── agents/
│   ├── requirementsAgent.ts  ← AgentConfig: system prompt + commands + followups
│   ├── pseudocodeAgent.ts
│   ├── developerAgent.ts
│   ├── reviewerAgent.ts
│   └── testerAgent.ts
└── tools/
    ├── toolInputs.ts                ← TypeScript interfaces matching JSON schemas
    ├── readActiveFileTool.ts        ← Reads open editor document
    ├── getWorkspaceSqlFilesTool.ts  ← Lists SQL files in workspace
    ├── analyzeSqlQualityTool.ts     ← Static analysis (injection, cursors, etc.)
    ├── detectSqlDialectTool.ts      ← T-SQL / PostgreSQL / MySQL detection
    └── generateTestScaffoldTool.ts  ← tSQLt / pgTAP / generic boilerplate
```
