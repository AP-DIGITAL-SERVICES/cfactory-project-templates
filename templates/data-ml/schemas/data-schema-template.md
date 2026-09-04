# Data Schema Template - Data ML

## Dataset Metadata

- Dataset Name: `[dataset_name]`
- Use Case: `[training/inference/monitoring]`
- Owner: `[team_or_person]`
- Refresh Cadence: `[batch interval or streaming]`
- Retention: `[days/months/years]`

## Column Schema

| Column | Type | Nullable | Role | Description | Validation |
|---|---|---|---|---|---|
| `entity_id` | string | no | key | Unique entity identifier | unique, non-empty |
| `event_timestamp` | datetime | no | time | Event timestamp in UTC | valid ISO 8601 |
| `label` | integer/float | yes | target | Ground-truth target value | allowed range |
| `feature_[name]` | numeric/categorical | yes | feature | Model feature | range/category checks |

## Derived Features

| Feature | Source Columns | Transformation | Freshness | Notes |
|---|---|---|---|---|
| `[feature_name]` | `[col_a,col_b]` | `[logic]` | `[SLA]` | `[parity requirement]` |

## Data Quality Rules

- Null-rate threshold per critical feature: `[x%]`.
- Allowed category set for categorical features.
- Range checks for numeric features.
- Timestamp monotonicity or staleness checks.
- Duplicate key checks at expected grain.

## Serving Contract Notes

- Required online fields and optional fallback fields.
- Missing feature behavior (`reject` or `default`) per field.
- Schema version and backward compatibility notes.
