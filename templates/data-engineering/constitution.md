# {{projectName}} Constitution - Data Engineering

## Core Principles

### I. Reliable Data Contracts
- Every source and sink MUST have explicit schema and ownership.
- Schema changes MUST be versioned with downstream communication plan.
- Pipelines without contract checks MUST NOT be promoted.

### II. Idempotent and Replayable Pipelines
- Ingestion and transform steps MUST be safe to rerun.
- Backfill/replay procedures MUST be documented and tested.
- Duplicate handling and watermarking rules MUST be explicit.

### III. Layered Data Modeling
- Raw, staging, and curated layers MUST be clearly separated.
- Dataset grain, keys, and retention rules MUST be documented.
- Curated outputs MUST be optimized for consumer query patterns.

### IV. Data Quality as a Gate
- Critical quality checks MUST gate publication to curated layers.
- Quality metrics and failures MUST be persisted for audit/trend analysis.
- Reconciliation checks with source totals are required for critical pipelines.

### V. Lineage and Governance
- End-to-end lineage from source to consumer artifacts is mandatory.
- Access control and audit logging for sensitive data are mandatory.
- Retention/deletion requirements MUST be encoded in pipeline design.

### VI. Operational Excellence
- SLAs/SLOs for freshness and success rate MUST be defined.
- Monitoring and alerting MUST detect SLA risk before consumer impact.
- Incident runbooks and ownership MUST exist for all critical pipelines.

### VII. Quality Gates
- Unit, integration, contract, and E2E data tests are mandatory.
- CI/CD MUST block promotion on failing quality or pipeline tests.
- Major changes require staged rollout and rollback verification.

## Non-Negotiable Testing Quality Gates

- Required suites on every pull request: transformation unit tests, pipeline integration tests, data-quality tests, source/sink contract tests, and end-to-end ingestion-to-curated tests.
- Publication gate: curated dataset publication MUST be blocked on critical data-quality failures and reconciliation mismatches.
- Replay/backfill gate: pipelines MUST pass deterministic replay/backfill validation, duplicate-handling checks, and late-arrival handling tests before promotion.
- Coverage thresholds enforced in CI: transformation and validation code lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test datasets MUST be deterministic and versioned: fixed seeds, frozen snapshots, explicit schema versions, and reproducible fixture generation.
- Flaky tests are release blockers: quarantine within 24 hours, assign owner, and fix before release; critical-path flaky tests MUST block merge and promotion.
- Release gate: no production promotion is allowed until all required suites pass in CI for the release commit.

## Governance

- Exceptions require written approval and expiry.
- Reviews enforce constitution compliance.
- Amendments require team consensus and migration guidance.

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
