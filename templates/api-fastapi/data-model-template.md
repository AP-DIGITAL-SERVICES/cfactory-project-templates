# Data Model: [FEATURE NAME] - FastAPI Backend

**Input**: `/specs/[###-feature-name]/spec.md`  
**Database**: [PostgreSQL/MySQL]  
**ORM**: [SQLAlchemy/SQLModel]

## 1. Domain Model

| Entity | Purpose | Owner | Invariants |
|---|---|---|---|
| `[EntityA]` | [Description] | [Team/module] | [Critical business rules] |
| `[EntityB]` | [Description] | [Team/module] | [Critical business rules] |

## 2. Schema Definition

For each table/document, specify:
- Key strategy and external identifiers.
- Required fields, nullable fields, defaults.
- Uniqueness and check constraints.
- Referential integrity and delete behavior.

## 3. Query and Index Plan

- Capture top read paths and write paths.
- Define indexes for major filters/sorts and unique lookups.
- Document expected cardinality and heavy query boundaries.
- Add idempotency/request-tracking table when retries are possible.

## 4. Transaction and Concurrency

- Define transaction boundaries per command.
- Choose conflict strategy (optimistic lock, unique constraint retry, serialization).
- Document eventual consistency windows where synchronous consistency is not feasible.

## 5. Migration Strategy (Alembic)

- Ordered migration rollout with backward compatibility notes.
- Backfill steps for required fields/defaults.
- Rollback strategy and operational safeguards.
- Post-migration verification queries and thresholds.

## 6. Validation and Compliance

- Define validation rules by field and domain constraints.
- Mark PII/sensitive fields and masking policies.
- Define retention/deletion windows and legal obligations.
- Define audit trails for privileged operations.
