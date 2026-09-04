# Data Model: [FEATURE NAME] - ASP.NET Core API

**Input**: `/specs/[###-feature-name]/spec.md`  
**Database**: [PostgreSQL/SQL Server/MySQL]  
**Data Access**: [EF Core/Dapper]

## 1. Domain and Aggregate Design

| Aggregate | Purpose | Owner | Invariants |
|---|---|---|---|
| `[AggregateA]` | [Description] | [Team/module] | [Rules that must always hold] |
| `[AggregateB]` | [Description] | [Team/module] | [Rules that must always hold] |

## 2. Schema Specification

For each table:
- Keys (PK/FK), uniqueness, and check constraints.
- Required fields and defaults.
- Timestamps and auditing fields.
- Soft delete and archival strategy when applicable.

## 3. Query Patterns and Indexes

- List critical query patterns (read and write hot paths).
- Define indexes for search, filtering, ordering, and joins.
- Document expected table growth and partition strategy if needed.
- Define idempotency/replay protection tables for write retries.

## 4. Transaction and Consistency Model

- Define transaction boundaries at command/use-case level.
- Define optimistic/pessimistic concurrency requirements.
- Document compensating actions for partial failure scenarios.

## 5. Migration and Rollback Plan

- Sequence migrations for safe deploys.
- Backfill strategy for new non-null fields.
- Rollback procedure and data-loss assessment.
- Post-migration verification checklist.

## 6. Governance and Compliance

- Data classification (public/internal/confidential/regulated).
- Encryption/masking requirements for sensitive fields.
- Retention/deletion obligations and audit event requirements.
- Access control rules for read/update/delete paths.
