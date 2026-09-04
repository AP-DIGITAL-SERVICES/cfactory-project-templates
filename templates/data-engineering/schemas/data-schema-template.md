# Data Schema Template - Data Engineering

## Source Contract

- Source Name: `[source_name]`
- Owner: `[team_or_system]`
- Delivery Mode: `[batch/stream/cdc]`
- Expected Arrival SLA: `[time window]`
- Contract Version: `[vX]`

## Schema

| Column | Type | Nullable | Key Type | Description | Quality Rule |
|---|---|---|---|---|---|
| `record_id` | string | no | primary/business | Unique record key | unique, non-empty |
| `event_timestamp` | datetime | no | time | Event occurrence in UTC | not null, recent |
| `[column_name]` | [type] | [yes/no] | [none] | [description] | [rule] |

## Change Handling

- Allowed additive changes: new nullable columns.
- Breaking changes: type changes, removed columns, key changes.
- Notification channel and lead time for breaking changes.

## Data Quality Checks

- Freshness check against ingestion SLA.
- Null and uniqueness checks for key fields.
- Referential integrity checks to parent datasets.
- Range and accepted-value checks for critical fields.
- Duplicate detection and late-arrival handling.

## Warehouse Mapping

| Source Column | Staging Column | Curated Column | Transformation |
|---|---|---|---|
| `[src_col]` | `[stg_col]` | `[mart_col]` | `[logic]` |

## Lineage Metadata

- Upstream dataset(s): `[list]`
- Downstream dataset(s): `[list]`
- Orchestrated by: `[dag/pipeline name]`
- Contact: `[owner]`
