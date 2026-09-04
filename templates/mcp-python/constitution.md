# {{projectName}} Constitution - MCP Python

## Core Principles

### I. Contract-First Tools
- Every MCP tool MUST publish strict input/output schema and examples.
- Tool behavior MUST be deterministic for equivalent inputs when possible.
- Breaking contract changes REQUIRE versioning and migration notes.

### II. Transport and Auth Discipline
- Transport choice MUST be explicit (`stdio/http/sse`) with rationale.
- Network transports MUST enforce authentication and request validation.
- Business logic MUST remain independent of transport implementation.

### III. Safety and Least Privilege
- All tool arguments MUST be validated and sanitized.
- Dangerous capabilities (filesystem, shell, network) MUST be guarded by policy.
- Secrets MUST come from secure config and never be logged.

### IV. Reliability
- Per-tool timeout budgets are mandatory.
- Retry policy MUST avoid unsafe retries and runaway loops.
- Error payloads MUST follow a stable, machine-readable shape.

### V. Observability
- Structured logs, metrics, and traces are required for production tools.
- Correlation IDs MUST be propagated through request handling.
- SLOs MUST be defined for critical tools.

### VI. Quality Gates
- Unit, contract, and integration tests are mandatory.
- CI blocks merge on lint/type/test failures.
- High-risk tools require negative/security test coverage.

## Non-Negotiable Testing Quality Gates

- Required suites on every pull request: unit tests, tool-contract tests, transport integration tests, authentication tests, and negative/safety tests.
- Contract gate: tool-contract tests MUST fail on any backward-incompatible schema or error-model change unless explicitly versioned and approved.
- Safety gate: high-risk tools MUST pass negative tests for malformed input, policy denials, and execution-limit boundaries (timeout, payload size, concurrency caps).
- Transport/auth gate: each enabled transport MUST pass auth success/failure, token expiry, and unauthorized request handling tests.
- Coverage thresholds enforced in CI: lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test fixtures MUST be deterministic and isolated: seeded fixtures, fixed clocks where needed, and no dependence on shared mutable state.
- Flaky tests are release blockers: quarantine within 24 hours, assign owner, and fix before release; critical-path flaky tests MUST block merge and release.
- Release gate: no production release is allowed until all required suites pass in CI for the release commit.

## Governance

- Exceptions require documented approval and expiry.
- Reviews must verify constitution compliance for each tool change.
- Amendments require team approval and migration guidance.

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
