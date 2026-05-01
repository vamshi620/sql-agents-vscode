# 🚀 SQL Agents — Native VS Code Quick-Start Guide

## What This Is

This folder (`c:\VAMSHI\custom agents`) contains **two ways** to use the SQL agents:

| Approach | Location | Requires Extension? | Invoke With |
|----------|----------|---------------------|-------------|
| **Native `.agent.md`** | `.github/agents/` | ❌ No | Agent picker dropdown |
| **VS Code Extension** | `src/`, `out/` | ✅ Yes (F5 to run) | `@sql-developer`, etc. |

---

## ⚡ Quick Start — Native Agents (Zero Installation)

### Step 1 — Reload VS Code
Press `Ctrl+Shift+P` → **Developer: Reload Window**

### Step 2 — Open Copilot Chat
Press `Ctrl+Alt+I`

### Step 3 — Pick Your Agent
Click the **agent picker** (dropdown at the bottom of the chat panel — NOT the `@` symbol).

You will see:
- 🗂️ **SQL Requirements Analyst**
- 📐 **SQL Pseudo Code Developer**
- 💻 **SQL Code Developer**
- 🔍 **SQL Code Reviewer**
- 🧪 **SQL Unit Testing Agent**

### Step 4 — Start Chatting
Type your request. No special commands needed — each agent knows its role from its instructions.

---

## 📁 File Structure

```
c:\VAMSHI\custom agents\
│
├── .github/                          ← Native VS Code agent configuration
│   ├── agents/                       ← Custom agent definitions (.agent.md)
│   │   ├── sql-requirements-analyst.agent.md
│   │   ├── sql-pseudocode-developer.agent.md
│   │   ├── sql-code-developer.agent.md
│   │   ├── sql-code-reviewer.agent.md
│   │   └── sql-unit-testing-agent.agent.md
│   │
│   ├── prompts/                      ← Reusable prompt files (.prompt.md)
│   │   └── sql-end-to-end-workflow.prompt.md
│   │
│   ├── instructions/                 ← Auto-applied file-specific instructions
│   │   └── sql-files.instructions.md   (applies to all *.sql files)
│   │
│   └── copilot-instructions.md       ← Global workspace instructions (always active)
│
├── .vscode/
│   ├── settings.json                 ← Enables agent discovery, prompt files, etc.
│   ├── launch.json                   ← F5 debug config for the extension
│   └── tasks.json                    ← Build tasks
│
└── src/                              ← VS Code Extension (TypeScript) — alternative approach
    ├── extension.ts
    ├── agentFactory.ts
    ├── agents/                       ← Agent configs
    └── tools/                        ← LanguageModelTool implementations
```

---

## 💬 Example Conversations

### Requirements Analysis
```
[Switch to: SQL Requirements Analyst]

We need a system to manage employee leave requests.
Employees submit leave requests which are approved by managers.
The system must track remaining leave balance by type (annual, sick, emergency).
```

### Generate Code
```
[Switch to: SQL Code Developer]

Generate a stored procedure for SQL Server that submits a leave request.
Parameters: EmployeeID, LeaveTypeID, StartDate, EndDate, Reason.
Include validation that the employee has enough remaining balance.
```

### Review Code
```
[Switch to: SQL Code Reviewer]

Review this SQL code for security, performance, and correctness issues:
[paste your code here or say "review the open file"]
```

### Generate Tests
```
[Switch to: SQL Unit Testing Agent]

Generate a complete tSQLt test suite for the leave request procedure above.
Cover: valid request, insufficient balance, overlapping dates, NULL inputs.
```

---

## 🔁 Use the End-to-End Workflow Prompt

1. Press `Ctrl+Shift+P` → **Chat: Run Prompt File**
2. Select `.github/prompts/sql-end-to-end-workflow.prompt.md`
3. Enter your requirement when prompted
4. Copilot chains through all 5 phases automatically

---

## ⚙️ VS Code Settings Applied

| Setting | Value | Why |
|---------|-------|-----|
| `chat.agentFilesLocations` | `.github/agents` | Tells VS Code where to find `.agent.md` files |
| `chat.promptFiles` | `true` | Enables `.prompt.md` file support |
| `chat.instructionsFilesLocations` | `.github/instructions` | Auto-applies per-file instructions |
| `github.copilot.chat.codeGeneration.useInstructionFiles` | `true` | Applies `copilot-instructions.md` globally |

---

## 🆚 Native vs Extension Comparison

| Feature | Native `.agent.md` | TypeScript Extension |
|---------|-------------------|---------------------|
| Setup time | **Instant** — just reload | Build + F5 or install .vsix |
| Slash commands | ❌ Not supported | ✅ `/ddl`, `/review`, etc. |
| Tool calling (auto read files) | ✅ Via built-in tools | ✅ Via `LanguageModelTool` |
| Follow-up suggestions | ❌ Not supported | ✅ `followupProvider` |
| Sharing with team | ✅ Commit `.github/` folder | Share `.vsix` file |
| Model selection | ✅ Per-agent in frontmatter | ✅ `vscode.lm.selectChatModels` |
| Custom logic | ❌ Instructions only | ✅ Full TypeScript |

**Recommendation:** Use **native agents** for day-to-day SQL work, and the **extension** when you need slash commands, custom tool logic, or the static analyser.
