# {{projectName}} Constitution — Mobile Application + FastAPI

## Core Principles

### I. Layered Architecture

- The API backend MUST follow a clean layered architecture: routers -> services -> repositories
- Each domain MUST have its own package with routers, services, schemas, and models
- Cross-domain communication MUST go through service interfaces, never direct repository access
- Circular imports are FORBIDDEN
- The mobile app MUST organize code by feature/domain with clear separation between UI, business logic, and data layers

### II. Type Safety (NON-NEGOTIABLE)

- Python type hints MUST be used on ALL function signatures, class attributes, and variables
- Pydantic v2 models MUST be used for ALL request/response validation and serialization
- `Any` type is FORBIDDEN except in rare, documented cases
- mypy or pyright strict mode MUST pass with zero errors
- Mobile app MUST use typed models matching API response shapes exactly

### III. API-First Design (Mobile-Optimized)

- All endpoints MUST follow RESTful conventions with mobile consumption in mind
- All endpoints MUST be auto-documented via FastAPI's built-in OpenAPI generation
- API MUST support versioning (URI prefix `/v1/`, `/v2/`) for app store compatibility
- Pagination MUST use cursor-based pagination (better for infinite scroll and real-time data)
- Response payloads MUST be optimized for mobile: minimal data, no over-fetching
- Error responses MUST include machine-readable codes for mobile localization
- All endpoints MUST declare explicit `response_model` for documentation
- API MUST support `If-Modified-Since` / `ETag` headers for bandwidth savings
- Batch endpoints SHOULD be provided where mobile would otherwise make many sequential requests

### IV. Offline-First Considerations

- The API MUST support idempotent write operations (mobile retries due to network instability)
- Write endpoints MUST accept `X-Idempotency-Key` header or `client_id` field
- The API MUST return full resource representations after mutations
- Timestamps MUST use ISO 8601 format with UTC timezone
- The API SHOULD support delta sync endpoints (`?updated_since=<timestamp>`)

### V. Test-First Development

- Unit tests MUST be written for all services using pytest
- Integration tests MUST be written for all routers using `httpx.AsyncClient`
- E2E tests MUST cover critical user journeys
- Mobile app MUST have unit tests for business logic and component tests for UI
- Mobile integration tests MUST cover offline scenarios
- Minimum coverage: 80% services, 70% routers, 60% mobile business logic

### VI. Security

- Authentication MUST use JWT with short-lived access tokens and refresh token rotation
- Refresh tokens MUST be stored securely on device (Keychain/Keystore)
- Authorization MUST use FastAPI Dependencies for role/permission-based access control
- All user input is validated by Pydantic models before reaching business logic
- Sensitive data MUST NEVER appear in logs, error messages, or API responses
- Rate limiting MUST be applied to authentication endpoints (via slowapi or custom middleware)
- Device registration MUST be supported for push notifications with token rotation
- Biometric authentication SHOULD be supported as a secondary auth method

### VII. Database & Data Access

- Database access MUST go through SQLAlchemy async or Tortoise-ORM
- All schema changes MUST use Alembic migrations (reversible)
- Soft deletes MUST be used for user-facing data
- All queries MUST be optimized: no N+1, proper indexing
- Database sessions MUST be managed via FastAPI dependency injection
- Async database drivers MUST be used (asyncpg for PostgreSQL)

### VIII. Error Handling & Observability

- All exceptions MUST be caught by FastAPI exception handlers
- Business logic errors MUST use custom exception classes (not raw HTTPException)
- Error responses MUST include machine-readable codes for mobile localization
- Structured logging MUST be used with correlation IDs
- Health check endpoints MUST be implemented
- Push notification delivery MUST be monitored
- API response times MUST be monitored (mobile users expect < 500ms)

### IX. Code Organization & Style

- Ruff MUST be configured for linting AND formatting
- Import order MUST be consistent (enforced by ruff)
- No business logic in routers
- Configuration MUST use Pydantic `BaseSettings`
- Environment-specific values MUST NEVER be hardcoded
- Dependencies MUST be managed with uv or Poetry

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
- Accessibility features MUST be supported (screen readers via `accessibilityLabel`, dynamic text sizing via `allowFontScaling`)
- Platform-specific code MUST use `.ios.tsx` / `.android.tsx` file extensions or `Platform.select()` — NEVER runtime `Platform.OS` branching in JSX

### XI. Infrastructure & Deployment

- API MUST be containerized with Docker (multi-stage builds)
- CI/CD MUST run lint, type-check, and tests before deployment
- Database migrations MUST run automatically during API deployment
- Mobile builds MUST use CI/CD (Fastlane, Codemagic, or GitHub Actions)
- Mobile releases MUST follow semantic versioning with forced update capability
- API MUST maintain backward compatibility for at least N-2 app versions
- ASGI server MUST be uvicorn (with gunicorn as process manager in production)

## Architectural Decision Requirements

- Every feature spec MUST reference `shared/architectural-decisions-guide.md`
- Caching, queues, streaming, and background jobs MUST be explicitly evaluated and justified
- Push notification infrastructure MUST be evaluated for every feature with user-facing events
- Offline support requirements MUST be explicitly stated per feature

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
- All code reviews MUST verify compliance
- Exceptions MUST be documented inline with justification

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
