# Implementation Plan: [FEATURE] - ASP.NET Core API

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: `/specs/[###-feature-name]/spec.md`

## Summary
[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

- Language: C# 12 / .NET 8+
- Framework: ASP.NET Core Web API
- Data Access: [EF Core/Dapper/Hybrid]
- Database: [PostgreSQL/SQL Server/MySQL]
- API Style: [REST/gRPC]
- Auth: [JWT/OAuth2/API key/mTLS]
- Cache/Queue: [Redis/RabbitMQ/Azure Service Bus/none]
- Observability: [OpenTelemetry + logging/metrics backend]

## Constitution Check

- [ ] API version strategy and compatibility window defined.
- [ ] OpenAPI and error model changes documented.
- [ ] AuthN/AuthZ policies mapped by endpoint.
- [ ] Resilience controls defined for each dependency.
- [ ] Migration/backfill/rollback path approved.
- [ ] Telemetry and SLO measurements planned.
- [ ] Test strategy covers unit, integration, contract, and E2E.

## Project Structure

```text
api/
  src/
    Api/
    Application/
    Domain/
    Infrastructure/
  tests/
    Unit/
    Integration/
    Contract/
```

## API and Data Plan

- Endpoint additions/changes with version impact.
- Entity/table/index updates and migration sequence.
- Permission matrix and policy changes.
- Failure-mode handling for dependencies.

## Delivery Phases

### Phase 0 - Discovery
- [ ] Validate constraints, contracts, and dependency risks.

### Phase 1 - Design
- [ ] Finalize OpenAPI updates and error code catalog.
- [ ] Finalize migration scripts and backfill strategy.
- [ ] Finalize telemetry dashboards and alert thresholds.

### Phase 2 - Implementation
- [ ] Implement domain/application handlers.
- [ ] Implement API endpoints, policies, validators.
- [ ] Implement cache/queue/integration adapters.

### Phase 3 - Verification and Rollout
- [ ] Run all test layers and contract checks.
- [ ] Validate staging SLOs and perform rollout rehearsal.
- [ ] Execute release and monitor error budget burn.
