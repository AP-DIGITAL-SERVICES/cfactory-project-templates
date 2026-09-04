# {{projectName}} Constitution - FastAPI Backend

## Core Principles

### I. Backend Scope
- This stack is backend-only; do not include frontend/mobile implementation concerns.
- Domain logic MUST remain independent of FastAPI transport details.
- Module boundaries MUST be explicit and enforceable in code reviews.

### II. Contract-First APIs
- Endpoints MUST be versioned (`/api/v1`) and represented in OpenAPI.
- Breaking changes REQUIRE migration/deprecation communication.
- Request/response/error schemas MUST use typed Pydantic models.

### III. Security and Access
- Auth is mandatory for protected routes with explicit scope/role policy.
- Input validation is mandatory; unknown/unsafe fields must be rejected.
- Secrets MUST use environment or secret managers; never commit credentials.

### IV. Reliability
- External calls MUST define timeout, retry, and failure behavior.
- Idempotency is required for retried write endpoints and webhook ingestion.
- Liveness/readiness endpoints are required for deployment safety.

### V. Data Integrity
- Schema changes MUST use Alembic migrations with rollback notes.
- Transaction boundaries for stateful multi-step operations MUST be explicit.
- Retention/deletion and audit requirements MUST be captured per feature.

### VI. Observability
- Structured logs, metrics, and traces are required in production paths.
- Correlation IDs MUST be propagated through request lifecycle.
- SLOs MUST define expected latency, availability, and error budgets.

### VII. Quality Gates
- Unit, integration, and contract tests are non-optional for shipped changes.
- CI blocks merges on lint/type/test/contract failures.
- Critical endpoint changes require E2E coverage before release.

## Non-Negotiable Testing Quality Gates

- Required suites on every pull request: unit tests, integration tests, end-to-end tests, and API contract tests.
- Endpoint-level quality gate: each new or changed endpoint MUST include positive-path coverage plus negative-path coverage for validation, auth, authorization, conflict, and dependency-failure behavior.
- Idempotency quality gate: retriable write paths MUST include tests for duplicate submissions, concurrent retries, and replay protection.
- Coverage thresholds enforced in CI: lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test data MUST be deterministic: seeded fixtures, fixed clocks for time-sensitive behavior, isolated databases/containers, and no shared mutable state.
- Flaky tests are release blockers: quarantine within 24 hours, assign owner, and fix before release; critical-path flaky tests MUST block merge.
- Release gate: no production release is allowed until all required suites pass in CI for the release commit, including contract and idempotency/error-path checks.

## Governance

- Exceptions require documented justification in the feature plan.
- Reviewers must check constitution compliance for every PR.
- Amendments require team approval and migration guidance.

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
