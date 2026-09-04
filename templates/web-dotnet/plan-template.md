# Implementation Plan: [FEATURE] - Web .NET Stack

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: `/specs/[###-feature-name]/spec.md`

## Summary
[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

### Frontend
- Framework: React + TypeScript
- State/Data: [Redux Toolkit + RTK Query / TanStack Query]
- UI: [shadcn/ui + Tailwind]
- Routing: [React Router]
- Testing: [Vitest/Jest + Playwright/Cypress]

### Backend
- Runtime: .NET 8+
- Framework: ASP.NET Core Web API
- Data Access: [EF Core/Dapper]
- Database: [PostgreSQL/SQL Server]
- Auth: [JWT/cookie + OAuth2]
- Observability: [OpenTelemetry + log/metrics stack]

## Constitution Check

- [ ] API contract updates defined and versioning impact reviewed.
- [ ] Auth flows for web + API mapped (including refresh/session expiry).
- [ ] Error handling UX defined for main failure scenarios.
- [ ] Migration and rollback strategy documented.
- [ ] Telemetry covers frontend UX and backend API paths.
- [ ] Test plan includes unit, integration, contract, and E2E.

## Project Structure

```text
frontend/
  src/
    app/
    features/
    shared/
backend/
  src/
    Api/
    Application/
    Domain/
    Infrastructure/
specs/[###-feature-name]/
```

## Design Plan

- Frontend views/components/state transitions.
- API endpoint changes and contract details.
- Data model/index/migration updates.
- Security and permission matrix.
- Caching strategy (browser/CDN/API) and invalidation.

## Delivery Phases

### Phase 0 - Discovery
- [ ] Validate UX flow, policy constraints, and dependency risks.

### Phase 1 - Design
- [ ] Finalize wireframes/UI states and API contract.
- [ ] Finalize schema/migrations and telemetry dashboards.

### Phase 2 - Implementation
- [ ] Build frontend feature and API endpoints.
- [ ] Wire authorization, validation, and error handling.

### Phase 3 - Verification and Release
- [ ] Execute tests and contract checks.
- [ ] Validate performance budgets and accessibility baseline.
- [ ] Roll out with monitoring and rollback readiness.
