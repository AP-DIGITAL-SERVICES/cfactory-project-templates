# {{projectName}} Constitution - NestJS API

## Core Principles

### I. Backend-Only Separation
- This stack is API-only. No frontend/mobile concerns belong in service modules.
- Domain modules MUST expose clear interfaces and avoid circular dependencies.
- Business rules MUST be framework-agnostic and testable without HTTP runtime.

### II. API Contract Discipline
- Every endpoint MUST be documented in OpenAPI and versioned (`/api/v1` minimum).
- Breaking API changes REQUIRE a migration/deprecation plan.
- Error responses MUST follow a stable, machine-readable structure.

### III. Security by Default
- All non-public routes MUST enforce authentication and authorization.
- Input validation and output filtering are mandatory on every endpoint.
- Secrets MUST come from environment/secret managers; never from source control.

### IV. Reliability and Resilience
- Outbound integrations MUST use explicit timeouts, retry policy, and failure handling.
- Idempotency is required for retried writes and webhook-style ingestion.
- Service health endpoints (`/health/live`, `/health/ready`) are required.

### V. Data Integrity
- All schema changes MUST be migration-driven and reversible.
- Transactions MUST protect multi-step invariants.
- Data retention, deletion, and audit requirements MUST be explicit in specs.

### VI. Observability and Operability
- Structured logs, metrics, and traces are mandatory for production paths.
- Every request MUST carry a correlation ID for debugging.
- SLOs and alerts MUST exist for availability, latency, and error rates.

### VII. Quality Gates
- Unit, integration, and contract tests are mandatory for shipped features.
- New endpoints MUST include positive and negative test coverage.
- CI MUST fail on lint, type-check, test failures, and contract drift.

## Non-Negotiable Testing Quality Gates

- Required suites on every pull request: unit tests, integration tests, end-to-end tests, and API contract tests.
- Endpoint-level quality gate: each new or changed endpoint MUST include positive-path coverage plus negative-path coverage for validation, auth, authorization, conflict, and dependency-failure behavior.
- Idempotency quality gate: retriable write paths MUST include tests for duplicate submissions, concurrent retries, and replay protection.
- Coverage thresholds enforced in CI: lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test data MUST be deterministic: seeded fixtures, fixed clocks for time-sensitive behavior, isolated databases/containers, and no shared mutable state.
- Flaky tests are release blockers: quarantine within 24 hours, assign owner, and fix before release; critical-path flaky tests MUST block merge.
- Release gate: no production release is allowed until all required suites pass in CI for the release commit, including contract and idempotency/error-path checks.

## Governance

- Any exception requires documented rationale in the feature plan.
- PR reviews MUST verify constitution compliance before merge.
- Amendments require team approval and migration guidance.

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
