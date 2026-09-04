# Best Practices Guide - React + ASP.NET Core

This guide covers standards for web frontend (React) and ASP.NET Core backend working as one system.

## Frontend (React) Practices

- Use feature-based folder boundaries and keep presentational components separate from data hooks.
- Use a dedicated data-fetching layer (RTK Query/TanStack Query) with cache invalidation policies.
- Handle loading, empty, error, and unauthorized states for every data screen.
- Keep forms typed with schema validation (Zod/Yup) and server-side error mapping.
- Enforce accessibility basics: semantic HTML, keyboard navigation, and contrast compliance.

## Backend (ASP.NET Core) Practices

- Keep controllers thin and place business logic in application handlers/services.
- Version APIs and preserve backward compatibility for deployed frontend versions.
- Enforce auth and policy-based authorization consistently.
- Use stable error codes and structured validation responses.
- Protect high-risk endpoints with rate limiting and anti-automation controls.

## Full-Stack API Contract Discipline

- Treat OpenAPI as source of truth for frontend client typing and integration tests.
- Use contract tests to detect breaking API changes before merge.
- Maintain explicit versioning and deprecation notices for changed endpoints.
- Define idempotency for retried form submissions and external callbacks.
- Use consistent pagination/filtering/sorting contracts across resources.

## Data and Performance

- Model query patterns from UI needs and add indexes before scale pain appears.
- Avoid overfetching; provide projection options and lightweight list endpoints.
- Apply frontend code splitting and lazy loading for route-level performance.
- Measure Core Web Vitals (LCP, INP, CLS) and backend p95 latency together.
- Cache safely at browser, CDN, and API layers with clear invalidation ownership.

## Observability and Reliability

- Propagate correlation IDs from browser requests through API logs/traces.
- Instrument frontend errors (Sentry or equivalent) and backend traces/metrics.
- Add SLO-driven alerts on API latency/error rate and user-visible web failures.
- Define graceful degradation for optional dependencies.
- Expose liveness/readiness endpoints and dependency health checks.

## Testing Strategy

- Frontend: unit tests for components/hooks, integration tests for pages, E2E for critical flows.
- Backend: unit + integration + contract tests for endpoints and data access.
- Full-stack: E2E tests for auth, key business workflows, and permissions.
- Performance: run smoke load tests for high-traffic endpoints and web render budgets.
- Security: add tests for auth bypass, broken access control, and input injection.

## Mandatory Testing Requirements (Non-Negotiable)

- Every change MUST include tests at the appropriate levels: frontend component tests, frontend integration tests, frontend E2E tests, backend unit tests, backend integration tests, backend E2E tests, and API contract tests between frontend and backend.
- API contract tests MUST run on every pull request and MUST fail on any backward-incompatible schema or error-shape change unless versioned and explicitly approved.
- Coverage minimums are enforced in CI: backend lines >= 85%, backend branches >= 75%, frontend lines >= 80%, frontend branches >= 70%, and changed lines coverage >= 90%.
- Critical paths MUST include explicit negative-path tests (authorization failures, validation failures, and retry/idempotency behavior for retried writes).
- Test data MUST be deterministic and reproducible: seeded factories, frozen clocks where needed, isolated databases, and no dependence on shared mutable state.
- Flaky tests are treated as failures: any flaky test MUST be quarantined within 24 hours, ticketed with owner, and fixed before release; no merge is allowed with known flaky critical-path tests.
- CI is the quality gate: pull requests MUST fail and MUST NOT merge when any required test suite fails (unit, integration, E2E, or contract).
