# Best Practices Guide - MCP Python

## Tool Contract Design

- Define strict input/output schemas for every tool.
- Keep tool names stable, descriptive, and task-oriented.
- Return predictable structured outputs; avoid free-form output as primary interface.
- Include explicit error codes and actionable remediation hints.
- Version tool contracts when behavior or schema changes.

## Transport and Authentication

- Choose transport (`stdio`, HTTP, or SSE) based on runtime context and latency needs.
- Enforce auth for network transports; define token validation and expiry behavior.
- Keep transport adapter thin; business logic must be transport-agnostic.
- Validate request size and content type at ingress.
- Document connection lifecycle and keepalive behavior.

## Safety and Guardrails

- Validate and sanitize tool arguments before execution.
- Add allowlists/denylists for filesystem, command execution, and network calls.
- Apply least privilege for credentials and external integrations.
- Add configurable safety limits (max rows, max duration, max payload size).
- Redact sensitive values in logs and error messages.

## Timeouts, Retries, and Error Shape

- Define per-tool timeout budgets and enforce hard timeouts.
- Retry only idempotent external calls with bounded exponential backoff.
- Standardize error shape: `code`, `message`, `details`, `retryable`, `correlation_id`.
- Distinguish user/input errors from dependency/runtime failures.
- Record timeout/failure reasons for triage and SLA reporting.

## Telemetry and Operations

- Emit structured logs with tool name, latency, status, and correlation ID.
- Track per-tool metrics (request count, error rate, p95 latency).
- Add tracing spans for high-latency downstream operations.
- Define SLOs for availability and latency by critical tool.
- Provide health/readiness endpoints for network transports.

## Testing Strategy

- Unit test argument validation and core business logic.
- Contract test each tool schema and error response format.
- Integration test transport adapters and auth paths.
- Add negative tests for unsafe inputs and policy violations.
- Add load tests for high-volume tools and long-running operations.

## Mandatory Testing Requirements (Non-Negotiable)

- Every tool change MUST include unit tests, tool-contract tests, transport integration tests, and negative/safety tests.
- Tool-contract tests MUST verify strict input/output schema compatibility and stable error model fields (`code`, `message`, `details`, `retryable`, `correlation_id`).
- Safety tests MUST cover policy denial paths, malformed/unsafe inputs, and boundary limits (timeouts, payload size, concurrency caps).
- Transport and authentication tests MUST validate connection lifecycle, auth failures, token expiry behavior, and unauthorized request handling for each enabled transport.
- Coverage minimums are enforced in CI: lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test inputs MUST be deterministic and reproducible: seeded fixtures, fixed clocks where needed, and isolated test doubles for external dependencies.
- Flaky tests are treated as failures: quarantine within 24 hours with owner assignment and fix deadline; no release is allowed with known flaky critical-path tests.
- CI is a hard gate: pull requests MUST fail and MUST NOT merge when any required test suite fails (unit, contract, safety, transport/auth, integration).
