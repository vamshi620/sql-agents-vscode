---
mode: agent
description: >
  Run a complete end-to-end SQL Server development workflow for a new feature.
  Automatically chains: Requirements → Pseudo Code → DDL → DML → Review → tSQLt Tests.
  All output is T-SQL for Microsoft SQL Server / Azure SQL.
tools:
  - codebase
  - filesystem
---

> **Dialect: Microsoft SQL Server / Azure SQL — T-SQL + tSQLt throughout.**

# SQL Server End-to-End Workflow Prompt

You are orchestrating the **complete SQL Server development lifecycle** for the following requirement.
All output must be **T-SQL valid for SQL Server 2016+ / Azure SQL**.

## The Requirement

{{requirement}}

---

## Phase 1 — Requirements Analysis

Act as the **SQL Requirements Analyst**:
1. Identify all entities, attributes, relationships, and cardinalities
2. Document business rules and integrity constraints
3. Flag any GDPR / PII fields
4. List clarifying questions (but proceed assuming reasonable defaults if requirement is clear enough)

---

## Phase 2 — Pseudo Code Design

Act as the **SQL Pseudo Code Developer**:
1. Design the query / procedure logic using pseudo code (no SQL syntax)
2. Document the data flow: Source → Filter → Join → Transform → Output
3. Identify edge cases and NULL handling requirements

---

## Phase 3 — Schema DDL

Act as the **SQL Code Developer**:
1. Generate `CREATE TABLE` DDL for all identified entities
2. Include all constraints (PK, FK, UNIQUE, CHECK, DEFAULT)
3. Add recommended indexes based on the query patterns identified

---

## Phase 4 — Query / Procedure Code

Act as the **SQL Code Developer**:
1. Generate the stored procedure or query implementing the core requirement
2. Include `TRY/CATCH`, transaction management, and input validation
3. Follow all code quality standards (parameterised, schema-qualified, UPPERCASE keywords)

---

## Phase 5 — Code Review

Act as the **SQL Code Reviewer**:
1. Review the generated DDL and procedure for security, performance, and correctness
2. Apply all severity checks: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
3. If issues are found, provide corrected SQL before proceeding

---

## Phase 6 — tSQLt Unit Tests

Act as the **SQL Unit Testing Agent**:
1. Generate a complete **tSQLt** test suite (SQL Server only)
2. Include: `tSQLt.NewTestClass`, `tSQLt.FakeTable` for isolation, test procedures
3. Cover: happy path, NULL inputs, boundary values, error cases, transaction rollback

---

## Deliverables Summary

At the end, produce a summary table:

| Phase | Status | Key Outputs |
|-------|--------|-------------|
| Requirements | ✅ | [entity count, rule count] |
| Pseudo Code | ✅ | [steps designed] |
| DDL | ✅ | [tables created, indexes] |
| Procedures | ✅ | [objects created] |
| Review | ✅ | [issues found/fixed] |
| Tests | ✅ | [test count, categories] |
