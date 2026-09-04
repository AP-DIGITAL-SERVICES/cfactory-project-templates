# {{projectName}} Constitution — Mobile Application + NestJS API

## Core Principles

### I. Modular Architecture

- The API backend MUST follow NestJS module boundaries: each domain has its own module with controllers, services, and DTOs
- Modules MUST be self-contained and independently testable
- Cross-module communication MUST go through well-defined service interfaces, never direct repository access
- Circular dependencies between modules are FORBIDDEN
- The mobile app MUST organize code by feature/domain with clear separation between UI, business logic, and data layers

### II. Type Safety (NON-NEGOTIABLE)

- TypeScript strict mode MUST be enabled in the API (`"strict": true`)
- `any` type is FORBIDDEN except in rare, documented cases
- All API request/response shapes MUST be defined as DTOs (API) and typed interfaces/models (mobile)
- DTOs MUST use `class-validator` decorators for runtime validation
- Database entities MUST have complete type definitions
- Mobile app MUST use typed models matching API response shapes exactly

### III. API-First Design (Mobile-Optimized)

- All endpoints MUST follow RESTful conventions with mobile consumption in mind
- All endpoints MUST be documented via `@nestjs/swagger` decorators
- API MUST support versioning (URI prefix `/v1/`, `/v2/`) for app store compatibility — old app versions may still call old API versions
- Pagination MUST use cursor-based pagination (better for infinite scroll and real-time data)
- Response payloads MUST be optimized for mobile: minimal data, no over-fetching, support sparse fieldsets where practical
- Error responses MUST follow a consistent structure with error codes the mobile app can use for localized messages
- API MUST support `If-Modified-Since` / `ETag` headers for efficient polling and bandwidth savings
- Batch endpoints SHOULD be provided where the mobile app would otherwise make many sequential requests

### IV. Offline-First Considerations

- The API MUST support idempotent write operations (mobile retries due to network instability)
- Write endpoints MUST accept client-generated UUIDs (`X-Idempotency-Key` header or `clientId` field) to prevent duplicate operations
- The API MUST return full resource representations after mutations (mobile needs to update local cache)
- Timestamps MUST use ISO 8601 format with timezone (UTC) for consistent cross-timezone handling
- The API SHOULD support delta sync endpoints (`GET /resources?updated_since=<timestamp>`) for efficient data synchronization

### V. Test-First Development

- Unit tests MUST be written for all services and utility functions using Jest
- Integration tests MUST be written for all controller endpoints using `@nestjs/testing` + Supertest
- End-to-end tests MUST cover critical user journeys
- Mobile app MUST have unit tests for business logic and widget/component tests for UI
- Mobile integration tests MUST cover critical user flows (login, core features, offline scenarios)
- Minimum test coverage: 80% for API services, 70% for controllers, 60% for mobile business logic

### VI. Security

- Authentication MUST use JWT with short-lived access tokens (15-30 min) and refresh token rotation
- Refresh tokens MUST be stored securely on device (Keychain/Keystore, NOT SharedPreferences/UserDefaults)
- Authorization MUST use NestJS Guards with role/permission-based access control
- All user input MUST be validated and sanitized before processing
- Sensitive data MUST NEVER appear in logs, error messages, or API responses
- CORS is less relevant for mobile but MUST be configured for any web admin panels
- Rate limiting MUST be applied to authentication endpoints and public APIs
- API MUST support device registration for push notifications with token rotation
- Biometric authentication SHOULD be supported as a secondary auth method
- Certificate pinning SHOULD be considered for high-security applications

### VII. Database & Data Access

- Database access MUST go through the ORM (TypeORM or Prisma)
- All schema changes MUST use migrations (reversible with `up` and `down`)
- Soft deletes MUST be used for user-facing data
- All queries MUST be optimized: no N+1 queries, proper indexing
- Database transactions MUST be used for multi-table write operations
- API responses for collections MUST include total count and pagination metadata

### VIII. Error Handling & Observability

- All exceptions MUST be caught by NestJS Exception Filters
- Business logic errors MUST use custom exception classes
- Error responses MUST include machine-readable codes for mobile error handling and localization
- Structured logging MUST be used with correlation IDs
- Health check endpoints (`/health`, `/ready`) MUST be implemented
- Push notification delivery MUST be monitored and logged
- API response times MUST be monitored (mobile users expect < 500ms)

### IX. Code Organization & Style

- ESLint + Prettier MUST be configured and enforced (API)
- Mobile code MUST follow platform conventions and linting rules
- No business logic in controllers/routers; they handle HTTP concerns only
- Configuration MUST use environment variables (API) and build flavors/schemes (mobile)
- Environment-specific values MUST NEVER be hardcoded

### X. Mobile-Specific Standards (React Native + Redux)

- The mobile app MUST use React Native 0.73+ with TypeScript strict mode and functional components exclusively
- State management MUST use Redux Toolkit (`@reduxjs/toolkit`) for global/shared state
- Redux slices MUST be organized by feature/domain (e.g., `authSlice`, `ordersSlice`, `connectivitySlice`)
- RTK Query MUST be used for all API data fetching, caching, and mutations — it replaces manual `useEffect` + `fetch` patterns
- Local component state (`useState`) MUST be used for UI-only state (modals, form inputs, animations) — do NOT put ephemeral UI state in Redux
- Navigation MUST use React Navigation v6+ with typed route parameters and deep linking
- Forms MUST use React Hook Form with Zod validation schemas
- The mobile app MUST handle all network states gracefully (online, offline, poor connectivity)
- Connectivity state MUST be tracked in Redux (via `@react-native-community/netinfo`) for app-wide offline awareness
- The mobile app MUST implement proper loading, error, and empty states for every screen (skeleton shimmer, not spinners)
- Push notifications MUST be implemented via `@react-native-firebase/messaging` with proper permission handling
- The mobile app MUST handle app lifecycle events (background, foreground, terminated) via `AppState` API
- Images MUST use `react-native-fast-image` for caching and proper resolution per device density
- Secure storage MUST use `react-native-keychain` for tokens (iOS Keychain / Android Keystore)
- The mobile app MUST support accessibility features (screen readers via `accessibilityLabel`, dynamic text sizing via `allowFontScaling`)
- Platform-specific code MUST use `.ios.tsx` / `.android.tsx` file extensions or `Platform.select()` — NEVER runtime `Platform.OS` branching in JSX

### XI. Infrastructure & Deployment

- API MUST be containerized with Docker (multi-stage builds)
- Environment configuration MUST follow 12-factor app principles
- CI/CD MUST run lint, type-check, and tests before deployment
- Database migrations MUST run automatically during API deployment
- Mobile builds MUST use CI/CD (Fastlane, Codemagic, or GitHub Actions)
- Mobile releases MUST follow semantic versioning and include forced update capability
- The API MUST maintain backward compatibility for at least N-2 mobile app versions

## Architectural Decision Requirements

- Every feature spec MUST reference `shared/architectural-decisions-guide.md`
- Caching, queues, streaming, and background jobs MUST be explicitly evaluated and justified
- Push notification infrastructure MUST be evaluated for every feature with user-facing events
- Offline support requirements MUST be explicitly stated per feature
- See `shared/architectural-decisions-guide.md` for detailed criteria

## Non-Negotiable Testing Quality Gates

- Required suites on every pull request: backend unit/integration/E2E tests, API contract tests, mobile unit/component tests, mobile integration tests, and mobile E2E tests.
- Device matrix is mandatory for critical journeys: latest iOS and Android plus one previous major version for each platform.
- Offline and reconnect quality gates are mandatory: critical flows MUST pass tests for offline creation/update, queued retries, conflict resolution, and idempotent server behavior.
- Coverage thresholds enforced in CI: backend lines >= 85%, backend branches >= 75%, mobile lines >= 80%, mobile branches >= 70%, and changed lines coverage >= 90%.
- Flaky tests are release blockers: quarantine within 24 hours, assign owner, and fix before release; critical-path flaky tests MUST block merge.
- Release gate: no production release is allowed until all required suites pass in CI for the release commit, including device-matrix and offline/reconnect checks.

## Governance

- This constitution supersedes all other development practices
- Amendments require: documented rationale, team review, migration plan
- All code reviews MUST verify compliance with these principles
- Exceptions MUST be documented inline with justification

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
