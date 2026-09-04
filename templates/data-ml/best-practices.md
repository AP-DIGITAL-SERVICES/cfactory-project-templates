# Best Practices Guide - Data ML

## Experiment Management

- Track every run with parameters, code version, dataset version, and metrics.
- Keep train/validation/test splits immutable and reproducible.
- Define one primary optimization metric and guardrail metrics.
- Log artifacts (models, feature stats, confusion matrices) per experiment.
- Promote only runs with reproducible lineage and documented assumptions.

## Data and Feature Engineering

- Validate source schema before feature generation.
- Build deterministic feature pipelines for train/inference parity.
- Version feature definitions and transformation code.
- Track feature freshness windows and null-rate thresholds.
- Encode leakage checks in preprocessing tests.

## Training and Evaluation

- Pin random seeds where feasible and document non-determinism sources.
- Use stratified/time-aware validation depending on problem type.
- Compare against baseline models before shipping complex models.
- Evaluate fairness/slice metrics for sensitive populations or segments.
- Record inference latency and memory profile with model quality metrics.

## Model Registry and Promotion

- Register models with explicit stage (`staging`, `production`, `archived`).
- Store model signature: input schema, output schema, and pre/post processing versions.
- Require promotion gates: quality threshold, latency budget, and explainability checks.
- Keep rollback-ready previous champion model in registry.
- Tie model releases to change logs and incident ownership.

## Serving and Operations

- Serve with explicit timeout budgets and graceful degradation strategy.
- Include model/version metadata in prediction responses (where safe).
- Use canary or shadow deployment for high-risk model changes.
- Enforce request validation to avoid invalid inference payloads.
- Monitor throughput, latency, error rate, and resource saturation.

## Monitoring and Drift

- Monitor feature drift, concept drift, and prediction distribution shifts.
- Set alert thresholds for data quality, drift metrics, and degraded quality proxies.
- Build feedback pipelines for delayed ground truth collection.
- Schedule retraining/recalibration based on drift and business outcomes.
- Run post-deploy performance reviews with product and data stakeholders.

## Testing

- Unit test feature transforms and schema validators.
- Integration test training and inference pipelines with representative samples.
- Contract test model serving input/output schema compatibility.
- Add regression tests to detect quality drops vs current champion model.
- Add load tests for expected online inference traffic.

## Mandatory Testing Requirements (Non-Negotiable)

- Every change MUST include data-quality tests, pipeline integration tests, and end-to-end pipeline tests that cover training, validation, and serving paths as applicable.
- Data pipelines MUST be validated for replay and backfill safety with deterministic outcomes across reruns.
- Model updates MUST include regression tests against the current champion model and drift checks on key feature and prediction distributions.
- Coverage minimums are enforced in CI: transformation and validation code lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test datasets MUST be deterministic and versioned (fixed seeds, frozen snapshots, explicit schema versions, and documented synthetic data generation).
- Flaky tests are treated as failures: quarantine within 24 hours with owner assignment and fix deadline; no promotion is allowed with known flaky critical-path checks.
- CI and release gates are strict: no merge and no model promotion when any required quality, regression, drift, replay, or E2E test fails.
