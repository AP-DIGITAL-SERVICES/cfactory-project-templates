# Best Practices Guide - MCP TypeScript

## Tool Contract Design

- Define Zod/JSON-schema contracts for all tool inputs and outputs.
- Keep tool interfaces stable and versioned.
- Return structured outputs with deterministic keys for client parsing.
- Include explicit error codes and remediation hints.
- Provide examples for success and failure responses.

## Transport and Auth

- Select `stdio`, HTTP, or SSE based on deployment context and client expectations.
- Require authentication for networked transports.
- Keep transport handlers minimal; core logic should be framework-agnostic.
- Enforce request validation and payload limits at the boundary.
- Document connection lifecycle, heartbeats, and reconnect behavior.

## Safety and Governance

- Validate/sanitize all arguments before execution.
- Enforce allowlists for file paths, commands, and outbound hosts.
- Apply capability-scoped credentials and least privilege access.
- Add per-tool execution caps (timeout, rows, bytes, concurrency).
- Redact secrets and personal data in telemetry.

## Reliability and Error Handling

- Define per-tool timeout budgets and cancellation behavior.
- Use bounded retries with backoff for idempotent external calls only.
- Standardize errors: `code`, `message`, `details`, `retryable`, `correlationId`.
- Separate user errors from infrastructure/transient failures.
- Capture retry and timeout telemetry for incident analysis.

## Observability

- Emit structured logs with request IDs and tool metadata.
- Collect per-tool success/failure/latency metrics.
- Add distributed traces around expensive dependency calls.
- Define SLOs and alerts for critical tool paths.
- Expose health/readiness endpoints for service transports.

## Testing

- Unit test validation and core tool logic.
- Contract test schema compatibility and error payloads.
- Integration test each transport and auth mode.
- Add security/negative tests for unsafe payloads.
- Load test high-throughput tool paths.

## Mandatory Testing Requirements (Non-Negotiable)

- Every tool change MUST include unit tests, tool-contract tests, transport integration tests, and negative/safety tests.
- Tool-contract tests MUST verify strict input/output schema compatibility and stable error model fields (`code`, `message`, `details`, `retryable`, `correlationId`).
- Safety tests MUST cover policy denial paths, malformed/unsafe inputs, and boundary limits (timeouts, payload size, concurrency caps).
- Transport and authentication tests MUST validate connection lifecycle, auth failures, token expiry behavior, and unauthorized request handling for each enabled transport.
- Coverage minimums are enforced in CI: lines >= 85%, branches >= 75%, and changed lines coverage >= 90%.
- Test inputs MUST be deterministic and reproducible: seeded fixtures, fixed clocks where needed, and isolated test doubles for external dependencies.
- Flaky tests are treated as failures: quarantine within 24 hours with owner assignment and fix deadline; no release is allowed with known flaky critical-path tests.
- CI is a hard gate: pull requests MUST fail and MUST NOT merge when any required test suite fails (unit, contract, safety, transport/auth, integration).
