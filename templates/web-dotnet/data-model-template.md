# Data Model: [FEATURE NAME] - Web .NET

**Input**: `/specs/[###-feature-name]/spec.md`  
**Backend**: ASP.NET Core  
**Database**: [PostgreSQL/SQL Server]

## 1. Domain Entities

| Entity | Purpose | API Exposure | Frontend Usage |
|---|---|---|---|
| `[EntityA]` | [Description] | [Endpoints] | [Views/features] |
| `[EntityB]` | [Description] | [Endpoints] | [Views/features] |

## 2. Persistence Schema

For each table:
- PK/FK and constraints.
- Required and optional fields.
- Audit fields (`created_at`, `updated_at`).
- Soft delete/archival policies when relevant.

## 3. Query Patterns from UI

- List routes/screens and corresponding API query needs.
- Define indexes for common filtering/sorting/search combinations.
- Define pagination strategy for large tables.
- Identify reporting/aggregation workloads and isolation needs.

## 4. Consistency and Transactions

- Define transaction boundaries per user action.
- Document concurrency behavior (optimistic lock/version columns where needed).
- Document eventual consistency windows for async operations.

## 5. Migration Plan

- Forward migration order and dependency notes.
- Backfill scripts for required fields.
- Rollback strategy and post-deploy data checks.

## 6. Data Governance

- PII field inventory and masking requirements.
- Retention/deletion requirements.
- Audit events for sensitive reads/writes.
- Access controls by role/scope.
