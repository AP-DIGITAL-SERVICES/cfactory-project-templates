# Data Model: [FEATURE NAME] - Data Engineering

**Input**: `/specs/[###-feature-name]/spec.md`

## 1. Dataset Inventory

| Layer | Dataset | Grain | Refresh SLA | Owner | Consumers |
|---|---|---|---|---|---|
| raw | `[raw_dataset]` | [event/row] | [SLA] | [team] | [pipelines] |
| staging | `[stg_dataset]` | [normalized row] | [SLA] | [team] | [models] |
| curated | `[mart_dataset]` | [business grain] | [SLA] | [team] | [BI/apps] |

## 2. Keys, Grain, and Relationships

- Define primary and business keys.
- Define slowly changing dimension strategy (if required).
- Define join cardinality expectations and anti-duplication rules.
- Define partition and clustering keys for scale.

## 3. Transformation Rules

- Source-to-staging normalization logic.
- Staging-to-curated business transformations.
- Late-arriving data and correction policies.
- Deduplication and upsert/merge strategy.

## 4. Quality and Reconciliation

- Critical checks: nulls, uniqueness, referential integrity, value ranges.
- Reconciliation checks: source totals vs curated aggregates.
- Publish gate criteria and escalation path.

## 5. Lineage and Metadata

- Upstream dependencies and downstream consumers.
- Dataset owner and support contact.
- Data classification and retention policy.

## 6. Operational Notes

- Backfill process and expected runtime windows.
- Failure recovery and replay strategy.
- SLA/SLO metrics tracked for this model.
