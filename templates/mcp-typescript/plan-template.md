# Implementation Plan: [FEATURE] - MCP TypeScript

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: `/specs/[###-feature-name]/spec.md`

## Summary
[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

- Language: TypeScript 5.x
- Runtime: Node.js 20+
- SDK: `@modelcontextprotocol/sdk`
- Transport: [stdio/http/sse]
- Auth: [none/jwt/oauth2/api key]
- External Dependencies: [APIs/databases/filesystems]
- Observability: [OpenTelemetry/logging/metrics stack]

## Constitution Check

- [ ] Tool schemas and versioning strategy documented.
- [ ] Transport, auth, and connection lifecycle defined.
- [ ] Safety policies and execution limits defined.
- [ ] Timeout/retry/error semantics defined.
- [ ] Metrics/traces/logging and SLOs defined.
- [ ] Test strategy includes contract and security tests.

## Work Plan

### Phase 0 - Discovery
- [ ] Identify required tools/resources/prompts and usage patterns.
- [ ] Analyze threat model and dependency risks.

### Phase 1 - Design
- [ ] Finalize contracts, error code taxonomy, and policy limits.
- [ ] Finalize transport/auth architecture.

### Phase 2 - Build
- [ ] Implement tool handlers and validation.
- [ ] Implement integration adapters and failure handling.
- [ ] Implement telemetry and health probes.

### Phase 3 - Verification and Rollout
- [ ] Run contract/integration/negative tests.
- [ ] Validate timeout/retry/safety behavior.
- [ ] Prepare deployment and rollback checklist.
