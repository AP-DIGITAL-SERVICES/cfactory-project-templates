# Best Practices Guide - FastAPI Backend

This guide defines implementation standards for backend-only FastAPI services.

## Service Architecture

- Organize by domain (`app/domains/<domain>`) with clear `api`, `service`, and `repository` layers.
- Keep routers thin and move business logic into services/use-cases.
- Depend on interfaces for persistence and external APIs to keep core logic testable.
- Use explicit dependency injection through FastAPI `Depends`.
- Enforce one-way dependency flow: `api -> service -> repository`.

## API Contracts and Versioning

- Version APIs (`/api/v1`) and include deprecation policy in release notes.
- Generate and publish OpenAPI for every release.
- Use consistent pagination format (`cursor`, `limit`, `next_cursor`) for list endpoints.
- Require idempotency key headers for retriable writes.
- Keep response and error schemas explicit with Pydantic models.

## Auth, Security, and Access Control

- Centralize auth in dependencies/middleware and avoid per-route custom checks.
- Use OAuth2/JWT/API key patterns with explicit scope checks.
- Validate and sanitize all input; reject unknown payload fields where possible.
- Apply rate limits to auth, search, and public endpoints.
- Never log tokens, secrets, or raw PII.

## Reliability and Error Handling

- Use strict timeout budgets for outbound I/O (database, HTTP, queue, cache).
- Define retry policy per dependency; avoid retries for non-idempotent operations.
- Return stable error payloads with `code`, `message`, `details`, `correlation_id`.
- Distinguish business validation (`422`) from conflicts (`409`) and transient failures (`503`).
- Use startup checks and readiness probes for critical dependencies.

## Data and Performance

- Use migrations (`alembic`) for all schema changes.
- Use transactions for multi-step invariants and financial/state transitions.
- Add indexes for high-volume filters and sort keys.
- Prevent N+1 issues via eager loading/select-in patterns.
- Measure p95 latency and optimize query hotspots before scaling infrastructure.

## Observability and Operations

- Use structured logs with request IDs and tenant/user context when applicable.
- Instrument traces and metrics via OpenTelemetry.
- Track RED metrics and endpoint-level latency histograms.
- Add dashboards and alerts for availability, error budget burn, and dependency health.
- Expose `/health/live` and `/health/ready` endpoints.

## Testing

- Unit test services/domain rules with deterministic fixtures.
- Integration test repositories against real DB containers.
- Contract test API schemas and error response structure.
- E2E test auth lifecycle, pagination, idempotent write behavior, and rollback handling.
- Add load tests for hot endpoints and validate against SLO targets.

## Mandatory Testing Requirements (Non-Negotiable)

- Every feature MUST include unit tests, integration tests, end-to-end tests, and API contract tests.
- Contract tests MUST verify request/response schemas, error payload shape, and backward compatibility for supported API versions.
- Write endpoints that can be retried MUST include idempotency tests (same idempotency key, concurrent retries, and replay protection).
- Negative-path coverage is mandatory for every endpoint: validation failures, authn/authz failures, dependency timeouts, and domain conflict/error paths.
- Coverage minimums enforced in CI: lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test data MUST be deterministic and reproducible: seeded factories, fixed clocks for time-sensitive behavior, isolated databases/containers, and no shared mutable state.
- Flaky tests are treated as failures: quarantine within 24 hours with assigned owner and fix plan; no merge is allowed with known flaky critical-path tests.
- CI is a hard gate: pull requests MUST fail and MUST NOT merge when any required test suite fails (unit, integration, E2E, contract).
