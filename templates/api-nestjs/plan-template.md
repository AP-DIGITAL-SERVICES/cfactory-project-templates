# Implementation Plan: [FEATURE] - NestJS API

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Summary
[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

- Language: TypeScript 5.x (strict)
- Runtime: Node.js 20+
- Framework: NestJS 10+
- Persistence: [PostgreSQL/MySQL + TypeORM or Prisma]
- API Style: [REST/GraphQL/gRPC]
- Auth Strategy: [JWT/API key/OAuth2/mTLS]
- Observability: [OpenTelemetry + metrics/logging stack]
- Deployment: Docker + CI/CD pipeline

## Constitution Check

- [ ] API versioning and backward compatibility strategy documented.
- [ ] AuthN/AuthZ model and sensitive endpoints identified.
- [ ] Error shape and domain error codes defined.
- [ ] Resilience controls defined (timeouts/retries/circuit breaker).
- [ ] Data migration strategy and rollback path defined.
- [ ] Logging, metrics, tracing, and SLOs planned.
- [ ] Test strategy includes unit, integration, and contract tests.

## Project Structure

```text
api/
  src/
    main.ts
    app.module.ts
    common/        # filters, guards, interceptors, pipes
    modules/
      [feature]/
        application/
        domain/
        infrastructure/
        interfaces/http/
  test/
  migrations/
```

## API and Data Plan

### Endpoints
- [List new/changed endpoints and version.]

### Data Model Impact
- [List entities/tables/indexes, ownership, and constraints.]

### Security
- [Map roles/scopes to each endpoint.]

### Resilience
- [List outbound dependencies, timeout budgets, fallback behavior.]

## Delivery Phases

### Phase 0 - Discovery
- [ ] Confirm contract changes and migration constraints.
- [ ] Validate architecture and dependency risks.

### Phase 1 - Design
- [ ] Finalize OpenAPI contract.
- [ ] Finalize data model and migration scripts.
- [ ] Define telemetry and dashboard requirements.

### Phase 2 - Implementation
- [ ] Implement domain/application logic.
- [ ] Implement controllers/DTOs/guards/filters.
- [ ] Add caching/queueing where justified.

### Phase 3 - Verification
- [ ] Run automated tests and contract checks.
- [ ] Validate p95 latency and error rates in staging.
- [ ] Prepare rollout and rollback checklist.
