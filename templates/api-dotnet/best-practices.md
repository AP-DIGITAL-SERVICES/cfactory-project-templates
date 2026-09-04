# Best Practices Guide - ASP.NET Core API

This guide defines backend-only standards for ASP.NET Core Web API services.

## Architecture and Code Organization

- Organize by domain verticals with `Application`, `Domain`, `Infrastructure`, and `Api` boundaries.
- Keep controllers minimal; business decisions belong to handlers/services.
- Access persistence via repositories/unit-of-work or explicit data access abstractions.
- Enforce dependency direction toward domain core.
- Use async APIs end-to-end and propagate cancellation tokens.

## API Contracts and Versioning

- Use explicit versioning (URL or header) and publish API lifecycle policy.
- Keep OpenAPI documentation updated with examples and error schemas.
- Standardize pagination and filtering contracts across all list endpoints.
- Use idempotency keys for retriable POST/PATCH operations.
- Return consistent error payloads with machine-readable codes.

## Authentication, Authorization, and Security

- Use `AddAuthentication` + `AddAuthorization` policies; avoid ad-hoc role checks.
- Prefer short-lived tokens and explicit refresh/revocation strategy.
- Validate all input using model validation and custom validators where needed.
- Protect sensitive endpoints with rate limiting and anti-abuse controls.
- Never log secrets or full PII payloads.

## Persistence and Data Integrity

- Manage schema changes via EF Core migrations (or chosen migration tooling).
- Use transactions for multi-aggregate updates and invariant protection.
- Add indexes for dominant query paths and uniqueness constraints.
- Prevent N+1 access patterns via projection/include strategy.
- Document retention and deletion behavior for regulated data.

## Reliability and Resilience

- Use `HttpClientFactory` with timeout, retry, and circuit-breaker policies.
- Handle transient failures with bounded retries and jitter.
- Define fallback behavior for dependency degradation.
- Implement graceful startup/shutdown and readiness gates.
- Ensure idempotent webhook/consumer processing.

## Observability and Operations

- Emit structured logs with correlation IDs and request metadata.
- Instrument traces and metrics with OpenTelemetry.
- Track SLO metrics: availability, p95/p99 latency, and error rate.
- Build dashboards per critical journey (auth, checkout, ingestion).
- Include health checks for DB/cache/queue and expose liveness/readiness.

## Testing

- Unit test domain rules, handlers, and authorization policies.
- Integration test persistence against real DB in containers.
- Contract test OpenAPI schema and error payload stability.
- E2E test auth flow, idempotent writes, and migration-dependent behavior.
- Add performance tests for high-throughput and fan-out endpoints.

## Mandatory Testing Requirements (Non-Negotiable)

- Every feature MUST include unit tests, integration tests, end-to-end tests, and API contract tests.
- Contract tests MUST verify request/response schemas, error payload shape, and backward compatibility for supported API versions.
- Write endpoints that can be retried MUST include idempotency tests (same idempotency key, concurrent retries, and replay protection).
- Negative-path coverage is mandatory for every endpoint: validation failures, authn/authz failures, dependency timeouts, and domain conflict/error paths.
- Coverage minimums enforced in CI: lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test data MUST be deterministic and reproducible: seeded factories, fixed clocks for time-sensitive behavior, isolated databases/containers, and no shared mutable state.
- Flaky tests are treated as failures: quarantine within 24 hours with assigned owner and fix plan; no merge is allowed with known flaky critical-path tests.
- CI is a hard gate: pull requests MUST fail and MUST NOT merge when any required test suite fails (unit, integration, E2E, contract).
