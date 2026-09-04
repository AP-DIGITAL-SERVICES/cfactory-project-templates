# Best Practices Guide - Data Engineering

## Ingestion and Source Management

- Define source contracts (schema, refresh cadence, SLA, ownership) before ingestion.
- Prefer incremental ingestion with watermark/change data capture over full reloads.
- Keep raw ingestion immutable and append-only when feasible.
- Track ingestion lag and source freshness explicitly.
- Build replay-safe ingestion for backfills and failure recovery.

## Orchestration and Pipelines

- Build idempotent tasks with explicit retries and timeout budgets.
- Use task-level ownership and dependency graphs with clear critical paths.
- Separate extract, transform, and load stages for observability and rollback.
- Parameterize environment and schedule; avoid hardcoded runtime assumptions.
- Keep orchestration metadata (run IDs, status, retries) queryable.

## Warehousing and Modeling

- Model by business entities and analytics use cases, not source system shape.
- Apply medallion/layered architecture (raw, staging, curated) where appropriate.
- Partition and cluster large tables based on dominant query patterns.
- Enforce naming conventions and semantic consistency across marts.
- Document grain, keys, and slowly changing dimension strategy.

## Data Quality and Validation

- Define quality checks (nulls, uniqueness, ranges, referential integrity) per dataset.
- Block downstream publish on critical quality failures.
- Distinguish warning vs fail-fast checks with explicit severity policy.
- Store quality results historically for trend analysis.
- Include data reconciliation checks between source and warehouse aggregates.

## Lineage, Catalog, and Governance

- Maintain lineage from source to curated outputs.
- Register datasets with owner, SLA, schema version, and consumers.
- Track breaking schema changes and notify downstream consumers.
- Apply least-privilege access control and audit access to sensitive datasets.
- Define retention and deletion policies per domain.

## SLAs, Observability, and Reliability

- Define SLAs/SLOs for freshness, completeness, and pipeline success rate.
- Instrument pipeline runtime, queue depth, retries, and failure causes.
- Alert on SLA risk (not only hard failure) for critical datasets.
- Maintain runbooks for incident triage and replay/backfill procedures.
- Test disaster scenarios: late source delivery, duplicate loads, schema drift.

## Testing Strategy

- Unit test transformations and business rules.
- Integration test pipelines against representative sample data.
- Contract test source and sink schemas.
- Add end-to-end data tests from ingestion to curated outputs.
- Performance test large backfills and peak schedule concurrency.

## Mandatory Testing Requirements (Non-Negotiable)

- Every change MUST include data-quality tests, pipeline integration tests, and end-to-end tests from ingestion to curated outputs.
- Pipelines MUST include replay/backfill tests that verify idempotency, late-arrival handling, and duplicate protection.
- Contract tests MUST validate source and sink schema compatibility, including fail-fast behavior on breaking schema drift.
- Coverage minimums are enforced in CI: transformation and validation code lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test datasets MUST be deterministic and versioned (fixed seeds, frozen snapshots, explicit schema versions, and reproducible fixture generation).
- Flaky tests are treated as failures: quarantine within 24 hours with owner assignment and fix deadline; no promotion is allowed with known flaky critical-path checks.
- CI and release gates are strict: no merge and no promotion when any required data-quality, contract, replay/backfill, performance, or E2E test fails.
