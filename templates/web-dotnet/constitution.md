# {{projectName}} Constitution - Web (React + ASP.NET Core)

## Core Principles

### I. Clear Frontend/Backend Boundaries
- Frontend concerns (UI state, UX, accessibility) stay in web app layers.
- Backend concerns (domain rules, persistence, integrations) stay in API layers.
- Cross-layer coupling is only allowed through versioned API contracts.

### II. Contract-First Integration
- OpenAPI is the canonical interface between React and ASP.NET Core.
- Breaking API changes REQUIRE compatibility strategy and release coordination.
- Typed API clients and error models are mandatory for frontend integration.

### III. Security by Design
- Auth and authorization policies MUST be enforced consistently in API.
- Frontend MUST protect sensitive routes and handle token/session expiry safely.
- Secrets and credentials MUST never be embedded in frontend bundles.

### IV. Reliability and Resilience
- External dependencies MUST have timeout/retry/fallback behavior.
- User-facing flows MUST handle partial failures with actionable feedback.
- Health checks and deploy readiness gates are required.

### V. Data Integrity and Governance
- Schema changes MUST be migration-driven and reversible.
- Business invariants MUST be enforced server-side.
- Data retention/deletion/audit requirements MUST be explicit.

### VI. Observability
- Correlation IDs MUST link browser events to backend traces/logs.
- Frontend and backend telemetry MUST support shared incident diagnosis.
- SLOs MUST cover both API and user experience metrics.

### VII. Quality Gates
- Frontend, backend, and contract tests are required for production changes.
- CI MUST block merge on lint/build/test failures.
- Critical flows require E2E coverage before release.

## Non-Negotiable Testing Quality Gates

- Required suites on every pull request: frontend component tests, frontend integration tests, frontend E2E tests, backend unit tests, backend integration tests, backend E2E tests, and API contract tests.
- Coverage thresholds enforced in CI: backend lines >= 85%, backend branches >= 75%, frontend lines >= 80%, frontend branches >= 70%, and changed lines coverage >= 90%.
- Contract tests MUST fail on backward-incompatible API schema or error-shape changes unless explicitly versioned and approved.
- Flaky tests are release blockers: quarantine within 24 hours, assign owner, and fix before release; critical-path flaky tests MUST block merge.
- Test data MUST be deterministic: seeded fixtures, isolated databases/environments, fixed clocks where required, and no reliance on shared mutable state.
- Release gate: no production release is allowed until all required suites pass in CI for the release commit and all critical user journeys have passing E2E evidence.

## Governance

- Exceptions require documented rationale in feature plans.
- Reviewers enforce constitution compliance in every PR.
- Amendments require team approval and migration guidance.

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
