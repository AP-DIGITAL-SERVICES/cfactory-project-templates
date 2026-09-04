# Implementation Plan: [FEATURE] - MCP Python

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: `/specs/[###-feature-name]/spec.md`

## Summary
[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

- Language: Python 3.11+
- SDK: FastMCP
- Transport: [stdio/http/sse]
- Auth: [none/jwt/oauth2/api key]
- External Integrations: [databases/APIs/filesystems]
- Observability: [logging/metrics/tracing stack]

## Constitution Check

- [ ] Tool contracts and schema versioning strategy defined.
- [ ] Transport and auth model documented.
- [ ] Safety guardrails and capability limits defined.
- [ ] Timeout/retry/error semantics defined.
- [ ] Telemetry and SLO targets defined.
- [ ] Test plan includes unit, contract, integration, and negative tests.

## Work Plan

### Phase 0 - Discovery
- [ ] Identify required tools/resources/prompts and client workflows.
- [ ] Assess security and dependency risks.

### Phase 1 - Design
- [ ] Define tool schemas, error codes, and policy limits.
- [ ] Define transport/auth and connection lifecycle.

### Phase 2 - Build
- [ ] Implement tool handlers and validation.
- [ ] Implement adapters for external dependencies.
- [ ] Implement telemetry and health checks.

### Phase 3 - Verification and Release
- [ ] Run contract/integration tests across target transports.
- [ ] Validate timeout/error behavior and safety checks.
- [ ] Prepare deployment and rollback checklist.
