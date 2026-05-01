---
applyTo: "**/*.sql"
---

# SQL Server (T-SQL) File Instructions

These instructions apply automatically to every `.sql` file in this workspace.
**This workspace targets Microsoft SQL Server / Azure SQL only — all code must be valid T-SQL.**

## Dialect Rules — T-SQL Always

- All code must be **Microsoft SQL Server T-SQL** — no PostgreSQL, MySQL, or Oracle syntax
- Use `NVARCHAR` / `VARCHAR` (never `TEXT` or PostgreSQL `VARYING`)
- Use `GETUTCDATE()` for timestamps (not `NOW()`, `CURRENT_TIMESTAMP` is acceptable)
- Use `ISNULL()` or `COALESCE()` for null handling (not `IFNULL()` / `NVL()`)
- Use `TOP n` or `OFFSET/FETCH NEXT` for limiting rows (never `LIMIT`)
- Use `@param` style parameters (never `$1, $2` PostgreSQL style)
- Use `[bracket]` or `"double-quote"` identifier quoting (not backticks)
- Use `dbo.` schema prefix on all object references

## T-SQL Coding Standards (Always Enforce)

- `SET NOCOUNT ON;` at the top of every procedure and function
- Wrap multi-statement DML in `BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`
- Use `BEGIN TRY … END TRY BEGIN CATCH … END CATCH` for error handling in procedures
- Use `THROW` (not `RAISERROR`) for raising errors — SQL Server 2012+
- `GO` batch separator after every `CREATE OR ALTER` statement
- `CREATE OR ALTER PROCEDURE` (not `DROP IF EXISTS` + `CREATE`)
- Include `WITH RECOMPILE` only when explicitly needed — never by default

## Inline Suggestion Rules

- ❌ Never suggest `SELECT *` — always list explicit columns
- ❌ Never suggest `UPDATE` or `DELETE` without a `WHERE` clause
- ❌ Never use string concatenation for dynamic SQL — use `sp_executesql` with params
- ✅ Use `QUOTENAME()` for dynamic object names in any dynamic SQL
- ✅ Schema-qualify all table/view/proc references (`dbo.TableName`)
- ✅ Use `EXISTS` instead of `IN` for subqueries against large tables
- ✅ Prefer `OFFSET/FETCH NEXT` for pagination over `TOP` in query results
