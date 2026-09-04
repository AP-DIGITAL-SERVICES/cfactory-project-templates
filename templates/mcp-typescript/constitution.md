# {{projectName}} Constitution - MCP TypeScript

## Core Principles

### I. Contract Stability
- Every tool MUST define strict input/output schema and examples.
- Contract changes MUST be versioned and backward compatibility reviewed.
- Response/error payloads MUST remain machine-readable and stable.

### II. Transport/Auth Clarity
- Transport choice (`stdio/http/sse`) MUST be explicit and justified.
- Network transports MUST enforce authentication and validation.
- Tool logic MUST be independent of transport adapter details.

### III. Safety by Default
- Inputs MUST be validated and sanitized before tool execution.
- Risky capabilities MUST be guarded by policy (path/host/command restrictions).
- Secrets MUST never be hardcoded or logged.

### IV. Reliability
- Timeout and cancellation behavior MUST be defined per tool.
- Retry policies MUST be bounded and only for idempotent calls.
- Error model MUST include retryability and correlation context.

### V. Observability
- Structured logs, metrics, and traces are mandatory for production usage.
- Correlation IDs MUST flow through request processing.
- SLOs MUST exist for critical tool capabilities.

### VI. Quality Gates
- Unit, contract, integration, and negative tests are mandatory.
- CI MUST block merge on lint/type/test failures.
- High-risk tools require explicit safety test coverage.

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
- PR reviews enforce constitution compliance.
- Amendments require team agreement and migration notes.

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
