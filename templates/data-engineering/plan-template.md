# Implementation Plan: [FEATURE] - Data Engineering

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: `/specs/[###-feature-name]/spec.md`

## Summary
[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

- Language: Python/SQL
- Orchestrator: [Airflow/Prefect/Dagster/dbt Cloud]
- Storage/Warehouse: [PostgreSQL/BigQuery/Snowflake/DuckDB]
- Transform Framework: [dbt/Spark/pandas/polars]
- Quality Framework: [Great Expectations/Soda/dbt tests/custom]
- Catalog/Lineage: [dbt docs/OpenMetadata/DataHub/custom]

## Constitution Check

- [ ] Source contracts and owners defined.
- [ ] Incremental/replay strategy documented.
- [ ] Layered model and dataset grain defined.
- [ ] Quality gates and severity policy defined.
- [ ] Lineage and catalog update path defined.
- [ ] SLA/SLO targets and alerting strategy defined.
- [ ] Test plan includes unit, integration, contract, and E2E checks.

## Work Plan

### Phase 0 - Discovery
- [ ] Validate source availability, schemas, and historical gaps.
- [ ] Identify pipeline consumers and critical reporting dependencies.

### Phase 1 - Design
- [ ] Define ingestion strategy and orchestration DAG flow.
- [ ] Define warehouse model and partitioning/indexing approach.
- [ ] Define quality checks and reconciliation metrics.

### Phase 2 - Build
- [ ] Implement ingestion, transforms, and load jobs.
- [ ] Implement orchestration schedules, retries, and alerts.
- [ ] Implement catalog/lineage publication.

### Phase 3 - Verify and Release
- [ ] Run backfill simulation and replay tests.
- [ ] Validate data quality and SLA adherence in staging.
- [ ] Execute production rollout with rollback plan.
