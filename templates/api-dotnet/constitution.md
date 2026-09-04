# {{projectName}} Constitution - ASP.NET Core API

## Core Principles

### I. API-Only Scope
- This stack is backend-only; no frontend/mobile implementation sections are allowed.
- Domain logic MUST remain independent from ASP.NET transport concerns.
- Module boundaries MUST be explicit and reviewable.

### II. Contract and Version Discipline
- Endpoints MUST be versioned and represented in OpenAPI.
- Breaking contract changes REQUIRE migration/deprecation strategy.
- Error payloads MUST preserve stable machine-readable codes.

### III. Security by Default
- Authentication and authorization policies are mandatory for protected routes.
- All inputs MUST be validated before domain execution.
- Secrets MUST come from secure configuration providers only.

### IV. Resilience and Runtime Safety
- Outbound integrations MUST define timeout/retry/circuit-breaker behavior.
- Idempotency is mandatory for retried write operations.
- Liveness and readiness health checks are required in production.

### V. Data Integrity
- Schema changes MUST use migration scripts and rollback plans.
- Multi-step invariants MUST be guarded by transactions.
- Auditability/retention/deletion requirements MUST be explicit per feature.

### VI. Observability
- Structured logging, metrics, and traces are required for critical flows.
- Correlation IDs MUST be propagated end-to-end.
- SLOs and alert policies MUST be defined before production rollout.

### VII. Quality Gates
- Unit, integration, contract, and E2E test layers are required.
- CI MUST block merge on failing lint/build/test/contract checks.
- High-risk changes require load/perf verification before release.

## Non-Negotiable Testing Quality Gates

- Required suites on every pull request: unit tests, integration tests, end-to-end tests, and API contract tests.
- Endpoint-level quality gate: each new or changed endpoint MUST include positive-path coverage plus negative-path coverage for validation, auth, authorization, conflict, and dependency-failure behavior.
- Idempotency quality gate: retriable write paths MUST include tests for duplicate submissions, concurrent retries, and replay protection.
- Coverage thresholds enforced in CI: lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test data MUST be deterministic: seeded fixtures, fixed clocks for time-sensitive behavior, isolated databases/containers, and no shared mutable state.
- Flaky tests are release blockers: quarantine within 24 hours, assign owner, and fix before release; critical-path flaky tests MUST block merge.
- Release gate: no production release is allowed until all required suites pass in CI for the release commit, including contract and idempotency/error-path checks.

## Governance

- Exceptions require written rationale in feature plans.
- Reviewers must enforce constitution adherence in PRs.
- Amendments require team approval and migration guidance.

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
