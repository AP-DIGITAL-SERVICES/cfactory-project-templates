# Data Model: [FEATURE NAME] - NestJS API

**Input**: `/specs/[###-feature-name]/spec.md`  
**Database**: [PostgreSQL/MySQL]  
**ORM**: [TypeORM/Prisma]

## 1. Domain Entities

Define each aggregate and persistence model explicitly.

| Entity | Purpose | Ownership | Lifecycle |
|---|---|---|---|
| `[EntityA]` | [Business concept] | [Module/team] | [Create/update/archive rules] |
| `[EntityB]` | [Business concept] | [Module/team] | [Retention/deletion rules] |

## 2. Relational Schema

For each table:
- Primary key strategy (`uuid` preferred for external IDs).
- Required/optional fields with constraints.
- Unique constraints and business invariants.
- Soft delete requirements (if applicable).

Example skeleton:

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | Stable external identifier |
| `created_at` | `timestamptz` | NOT NULL | Audit |
| `updated_at` | `timestamptz` | NOT NULL | Audit |
| `[field]` | `[type]` | [constraint] | [purpose] |

## 3. Indexing and Query Paths

- List top read/write query patterns.
- Add indexes for filter/sort/join columns.
- Document high-cardinality indexes and expected selectivity.
- Include idempotency lookup index for retried writes.

## 4. Transaction and Consistency Rules

- Define transaction boundaries per use case.
- Document isolation requirements for conflict-prone operations.
- Define compensating actions when distributed steps fail.

## 5. Migration Plan

- Migration sequence for non-breaking rollout.
- Backfill strategy for new required columns.
- Rollback procedure and data safety notes.
- Production validation queries post-migration.

## 6. Data Quality and Compliance

- Field validation rules and accepted ranges.
- PII classification and encryption/masking requirements.
- Retention/deletion policy and legal constraints.
- Audit events required for sensitive operations.
