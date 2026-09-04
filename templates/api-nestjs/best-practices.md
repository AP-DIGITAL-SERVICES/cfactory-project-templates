# Best Practices Guide - NestJS API

This guide defines implementation standards for backend-only services built with NestJS.

## 1) Architecture and Boundaries

- Organize by domain modules (`users`, `billing`, `orders`, `notifications`) and keep each module cohesive.
- Keep controllers focused on transport concerns (request parsing, auth context, response mapping).
- Keep business rules in application services/use-cases.
- Keep data access in repositories/adapters, never directly in controllers.
- Avoid circular dependencies between modules.
- Use explicit interfaces for cross-module integrations.

## 2) API Design and Versioning

- Use explicit versioning (`/api/v1`) and document the deprecation policy.
- Prefer additive contract changes; plan migration windows for breaking changes.
- Standardize pagination:
  - cursor pagination for high-churn/time-ordered resources
  - offset pagination only when justified
- Support idempotency keys for create/update operations that may be retried.
- Use consistent response envelopes for list endpoints (`data`, `meta`, `links`).
- Publish OpenAPI docs for all public/partner endpoints.

## 3) Validation and Error Contract

- Validate all input DTOs with `class-validator` and `class-transformer`.
- Reject unknown properties for external APIs.
- Standardize error payload:
  - `code` (stable machine-readable code)
  - `message` (human-readable summary)
  - `details` (field/domain specifics)
  - `correlationId` (for support tracing)
- Map domain failures to explicit HTTP semantics (`400`, `401`, `403`, `404`, `409`, `422`).
- Never leak stack traces or secret configuration values in API responses.

## 4) Authentication and Authorization

- Use one primary auth strategy per service (`JWT`, `OAuth2`, `API key`, or `mTLS`) and document exceptions.
- Apply authorization via guards/policies, not ad-hoc checks in controllers.
- Model roles/scopes explicitly and validate permissions at use-case boundaries.
- Enforce rate limiting on auth and abuse-prone endpoints.
- Rotate signing keys/secrets and support revocation where applicable.

## 5) Data and Persistence

- Use migrations for every schema change; never rely on auto-sync in production.
- Define transaction boundaries explicitly for multi-entity writes.
- Design indexes for read paths and conflict/idempotency keys.
- Prevent N+1 query patterns and over-fetching.
- Soft delete only where business/audit requirements justify it.
- Keep DB constraints aligned with domain invariants.

## 6) Resilience and Performance

- Define timeout budgets for outbound dependencies.
- Retry only idempotent operations with bounded exponential backoff.
- Use circuit breakers/bulkheads for unstable dependencies.
- Cache read-heavy data with explicit ownership, TTL, and invalidation rules.
- Add backpressure and queueing for async/non-critical workloads.
- Track p95/p99 latency goals and enforce SLO-based alerts.

## 7) Observability and Operability

- Emit structured logs with `correlationId`, actor/tenant context (when safe), and operation name.
- Instrument RED metrics (request rate, error rate, duration).
- Add OpenTelemetry tracing on critical paths.
- Implement readiness/liveness endpoints and dependency health checks.
- Distinguish user-caused errors from system failures in metrics and alerts.

## 8) Security and Compliance

- Validate and sanitize all input boundaries.
- Redact secrets and sensitive PII in logs/telemetry.
- Enforce least privilege for DB, queue, and third-party credentials.
- Run dependency and container vulnerability scans in CI.
- Keep audit trails for sensitive state transitions where required.

## 9) Testing Strategy

- Unit tests for domain/use-case rules.
- Integration tests for repositories and database interactions.
- Contract tests for API schemas and error payloads.
- E2E tests for critical flows (auth lifecycle, idempotent writes, pagination, conflict paths).
- Performance tests for high-cardinality list/filter endpoints.

## 10) Delivery and CI/CD

- Enforce lint, type check, and tests before merge.
- Keep Docker images minimal and non-root.
- Ensure migrations are executed in deployment workflows.
- Prefer progressive rollout for high-risk releases.
- Document rollback procedure per environment.

## 11) Recommended API Conventions

- Resource naming in plural (`/users`, `/orders`).
- Use explicit filters and sort parameters.
- Return deterministic ordering for paginated results.
- Include idempotency key support where clients can retry.
- Include request correlation ID in response headers.

## 12) Anti-Patterns to Avoid

- Business logic in controllers.
- Hidden cross-module coupling via internal imports.
- Inconsistent error formats between endpoints.
- Unbounded retries and missing timeout budgets.
- Lack of ownership for cache keys and async jobs.
- Adding infra components without explicit justification.

## 13) Mandatory Testing Requirements (Non-Negotiable)

- Every feature MUST include unit tests, integration tests, end-to-end tests, and API contract tests.
- Contract tests MUST verify request/response schemas, error payload shape, and backward compatibility for supported API versions.
- Write endpoints that can be retried MUST include idempotency tests (same idempotency key, concurrent retries, and replay protection).
- Negative-path coverage is mandatory for every endpoint: validation failures, authn/authz failures, dependency timeouts, and domain conflict/error paths.
- Coverage minimums enforced in CI: lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test data MUST be deterministic and reproducible: seeded factories, fixed clocks for time-sensitive behavior, isolated databases/containers, and no shared mutable state.
- Flaky tests are treated as failures: quarantine within 24 hours with assigned owner and fix plan; no merge is allowed with known flaky critical-path tests.
- CI is a hard gate: pull requests MUST fail and MUST NOT merge when any required test suite fails (unit, integration, E2E, contract).
