# Implementation Plan: [FEATURE] - FastAPI Backend

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: `/specs/[###-feature-name]/spec.md`

## Summary
[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

- Language: Python 3.11+
- Framework: FastAPI
- Validation: Pydantic v2
- ORM/DB: [SQLAlchemy/SQLModel + PostgreSQL/MySQL]
- Migrations: Alembic
- Auth: [OAuth2/JWT/API key/mTLS]
- Cache/Queue: [Redis/Celery/RQ/none]
- Observability: [OpenTelemetry + logs/metrics backend]

## Constitution Check

- [ ] API versioning and compatibility policy defined.
- [ ] Endpoint contracts and error schema defined.
- [ ] AuthN/AuthZ and rate limiting requirements mapped.
- [ ] Timeouts/retries/circuit-breaker policies documented.
- [ ] Migration, rollback, and backfill plans defined.
- [ ] SLOs and telemetry requirements defined.
- [ ] Test strategy includes unit/integration/contract/E2E layers.

## Project Structure

```text
api/
  app/
    main.py
    core/            # config, logging, security, middleware
    domains/
      [feature]/
        api/
        service/
        repository/
        models/
        schemas/
  tests/
  alembic/
```

## API and Data Plan

- New endpoints and method semantics.
- Data model/table/index changes.
- Authorization matrix by endpoint.
- Failure modes and fallback behavior.

## Implementation Phases

### Phase 0 - Discovery
- [ ] Confirm contract boundaries and dependency constraints.
- [ ] Identify data migration risks and operational risks.

### Phase 1 - Design
- [ ] Finalize OpenAPI details and schema definitions.
- [ ] Finalize DB model and migration plan.
- [ ] Define logs/metrics/traces and dashboards.

### Phase 2 - Build
- [ ] Implement service/repository logic.
- [ ] Implement routers, schemas, dependencies, and auth checks.
- [ ] Implement cache/queue integration where justified.

### Phase 3 - Verify and Rollout
- [ ] Execute automated tests and contract validation.
- [ ] Validate staging SLOs and run smoke/load tests.
- [ ] Prepare rollout/rollback and post-deploy verification.
