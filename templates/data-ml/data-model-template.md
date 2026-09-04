# Data Model: [FEATURE NAME] - Data ML

**Input**: `/specs/[###-feature-name]/spec.md`

## 1. Dataset Definitions

| Dataset | Purpose | Grain | Refresh | Owner |
|---|---|---|---|---|
| `training_dataset` | Model training | [row grain] | [daily/weekly] | [team] |
| `inference_dataset` | Online/batch scoring | [row grain] | [real-time/batch] | [team] |

## 2. Feature Specification

For each feature define:
- Name and semantic meaning.
- Type and allowed range.
- Null handling/default/imputation.
- Computation logic and source fields.
- Freshness expectation.

## 3. Label and Target Definition

- Target variable definition and business interpretation.
- Label generation window and data delay assumptions.
- Exclusion rules and leakage safeguards.

## 4. Split and Sampling Strategy

- Train/validation/test split method.
- Time-based constraints (if temporal data).
- Class imbalance handling (weights/resampling).

## 5. Model Input/Output Contract

- Input schema with required fields and types.
- Output schema (`prediction`, `score`, optional explanation fields).
- Versioning policy for contract changes.

## 6. Quality and Drift Metrics

- Data quality checks (null %, range, uniqueness, cardinality).
- Drift metrics per critical feature (PSI, KS, distribution distance).
- Alert thresholds and response actions.
