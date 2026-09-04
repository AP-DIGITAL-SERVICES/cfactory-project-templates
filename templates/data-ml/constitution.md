# {{projectName}} Constitution - Data ML

## Core Principles

### I. Reproducibility First
- Every experiment MUST be reproducible from code, config, and dataset versions.
- Training runs without lineage metadata MUST NOT be promoted.
- Data splits and feature definitions MUST be versioned and immutable per run.

### II. Feature and Data Integrity
- Input schema validation is mandatory at training and serving boundaries.
- Train/inference feature parity MUST be enforced through shared transforms.
- Leakage checks and data quality checks are required for production pipelines.

### III. Evaluation and Risk Management
- Models MUST be compared to baselines before promotion.
- Promotion requires threshold checks on primary and guardrail metrics.
- Segment/slice analysis is required for high-impact features.

### IV. Registry and Release Governance
- All deployable models MUST be registered with signature and metadata.
- Promotion, rollback, and deprecation workflows MUST be documented.
- Serving artifacts MUST map to exact training runs and data snapshots.

### V. Production Reliability
- Serving endpoints MUST define timeout, retry, and fallback behavior.
- Drift and performance monitoring MUST exist before production release.
- Incident ownership and on-call runbooks MUST be defined for model failures.

### VI. Compliance and Security
- Sensitive data handling, masking, and retention policies are mandatory.
- Access to training data and model artifacts MUST follow least privilege.
- Audit logs MUST capture model promotions and production changes.

### VII. Quality Gates
- Unit, integration, and regression tests are mandatory.
- CI MUST block merges on failing checks or missing schema validation.
- Major model updates require staged rollout and rollback validation.

## Non-Negotiable Testing Quality Gates

- Required suites on every pull request: transformation unit tests, pipeline integration tests, data-quality tests, regression tests against current champion, and end-to-end pipeline tests.
- ML release gate: model updates MUST pass regression thresholds versus the current champion and MUST pass drift checks on key feature/prediction distributions.
- Replay/backfill gate: training and data pipelines MUST pass deterministic replay/backfill validation before promotion.
- Coverage thresholds enforced in CI: transformation and validation code lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test datasets MUST be deterministic and versioned: fixed seeds, frozen snapshots, explicit schema versions, and reproducible fixture generation.
- Flaky tests are release blockers: quarantine within 24 hours, assign owner, and fix before release; critical-path flaky tests MUST block merge and model promotion.
- Release gate: no production model promotion is allowed until all required suites pass in CI for the release commit.

## Governance

- Exceptions require documented approval and expiry date.
- Reviews must verify constitution compliance per release.
- Amendments require team approval and migration guidance.

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
