# SQL Server — Global Copilot Instructions

These instructions apply to **all GitHub Copilot interactions** in this workspace.

> **⚠️ This workspace is SQL Server / Azure SQL ONLY.**
> All generated code must be valid **T-SQL**. Do not produce PostgreSQL, MySQL, Oracle, or generic ANSI SQL unless the user explicitly asks for a comparison.

---

## Always Apply These T-SQL Standards

### Syntax — SQL Server Only
- Use `NVARCHAR(n)` / `VARCHAR(n)` for strings — never `TEXT` or `CLOB`
- Use `GETUTCDATE()` for UTC timestamps, `GETDATE()` for local server time
- Use `ISNULL()` or `COALESCE()` — never `IFNULL()` or `NVL()`
- Use `TOP n` or `OFFSET n ROWS FETCH NEXT n ROWS ONLY` — never `LIMIT`
- Use `@ParameterName` style — never `$1` / `?` / `:name`
- Use `[BracketQuoting]` or `"DoubleQuoteQuoting"` — never backticks
- Use `GO` after every `CREATE OR ALTER` DDL batch

### Security (Zero Tolerance)
- **Never** concatenate user input into SQL strings
- Use `sp_executesql` with typed parameters for any dynamic SQL
- Use `QUOTENAME()` for any dynamic object name (table, column, schema)
- **Never** write `SELECT *` in production code

### Procedure Standards
- `SET NOCOUNT ON;` at the start of every procedure
- `BEGIN TRY … END TRY BEGIN CATCH … END CATCH` for error handling
- `BEGIN TRANSACTION / COMMIT / ROLLBACK` for multi-statement DML
- Use `THROW` for raising errors (SQL Server 2012+, not `RAISERROR`)
- `CREATE OR ALTER PROCEDURE` — not `DROP + CREATE`

### Performance Defaults
- Prefer set-based T-SQL over `CURSOR` / `WHILE` loops
- `EXISTS` over `IN` for large-table subqueries
- `INCLUDE` columns on non-clustered indexes for covering reads
- `WITH (NOLOCK)` only when dirty reads are explicitly acceptable — never as a default "performance trick"

### Code Organisation
- Every stored procedure, function, and view needs a header comment:
  ```sql
  -- ============================================================
  -- Object:  dbo.[ObjectName]
  -- Purpose: [What it does]
  -- Server:  SQL Server 2019+ / Azure SQL
  -- Author:  [Author]
  -- Created: [Date]
  -- ============================================================
  ```
- Schema-qualify **all** object references: `dbo.TableName`, never bare `TableName`

---

## SQL Development Lifecycle — Agent Reminder

| Phase | Agent to Use |
|-------|-------------|
| 📋 Requirements | **SQL Requirements Analyst** |
| 📐 Logic design | **SQL Pseudo Code Developer** |
| 💻 Write code | **SQL Code Developer** |
| 🔍 Review code | **SQL Code Reviewer** |
| 🧪 Write tests | **SQL Unit Testing Agent** |

All agents are configured for **SQL Server / T-SQL** only.
Testing uses the **tSQLt** framework.
