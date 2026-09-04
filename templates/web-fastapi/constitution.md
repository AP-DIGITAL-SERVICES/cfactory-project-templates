# {{projectName}} Constitution — Web Application + FastAPI

## Core Principles

### I. Layered Architecture

- The backend MUST follow a clean layered architecture: routers (API layer) -> services (business logic) -> repositories (data access)
- Each domain MUST have its own package with routers, services, schemas, and models
- Cross-domain communication MUST go through service interfaces, never direct repository access from other domains
- Circular imports are FORBIDDEN; use dependency injection and interface abstractions
- The frontend MUST organize code by feature/domain, not by file type

### II. Type Safety (NON-NEGOTIABLE)

- Python type hints MUST be used on ALL function signatures, class attributes, and variables
- Pydantic v2 models MUST be used for ALL request/response validation and serialization
- `Any` type is FORBIDDEN except in rare, documented cases with an inline comment explaining why
- mypy or pyright strict mode MUST pass with zero errors
- Frontend TypeScript strict mode MUST be enabled (`"strict": true`)
- All API request/response shapes MUST be defined as Pydantic schemas (backend) and TypeScript types (frontend)

### III. API Design

- All endpoints MUST follow RESTful conventions (proper HTTP verbs, status codes, resource naming)
- All endpoints MUST be auto-documented via FastAPI's built-in OpenAPI generation
- Request validation MUST use Pydantic models as endpoint parameters (FastAPI validates automatically)
- Pagination MUST use cursor-based or offset-based pagination consistently (choose one, document in plan)
- Error responses MUST follow a consistent structure: `{ "detail": { "code": str, "message": str, "fields": list? } }`
- API versioning strategy MUST be defined in the plan (URI prefix `/v1/` or header-based)
- All endpoints MUST declare explicit response models via `response_model` parameter

### IV. Test-First Development

- Unit tests MUST be written for all services and utility functions using pytest
- Integration tests MUST be written for all router endpoints using `httpx.AsyncClient` + `TestClient`
- End-to-end tests MUST cover critical user journeys
- Frontend components MUST have tests using the project's chosen testing library
- Minimum test coverage target: 80% for services, 70% for routers, 60% for frontend components
- Tests MUST NOT depend on external services; use mocks, fixtures, and factory functions
- Tests MUST use pytest fixtures for setup/teardown and dependency injection overrides

### V. Security

- Authentication MUST use JWT with short-lived access tokens and refresh token rotation
- Authorization MUST use FastAPI Dependencies for role/permission-based access control
- All user input is validated by Pydantic models before reaching business logic
- Sensitive data (passwords, tokens) MUST NEVER appear in logs, error messages, or API responses
- CORS MUST be configured with explicit allowed origins (no wildcard `*` in production)
- Rate limiting MUST be applied to authentication endpoints and public APIs (via slowapi or custom middleware)
- Security headers MUST be set via middleware (X-Content-Type-Options, X-Frame-Options, etc.)
- Password hashing MUST use bcrypt via passlib with a work factor >= 12

### VI. Database & Data Access

- Database access MUST go through SQLAlchemy (async) or Tortoise-ORM; raw SQL is allowed only for complex queries with documented justification
- All schema changes MUST use Alembic migrations; never modify the database manually
- Migrations MUST be reversible (include both `upgrade` and `downgrade`)
- Soft deletes MUST be used for user-facing data; hard deletes only for system/temporary data
- All queries MUST be optimized: no N+1 queries, proper indexing, query analysis for complex joins
- Database sessions MUST be managed via FastAPI dependency injection (not global state)
- Async database drivers MUST be used (asyncpg for PostgreSQL) for non-blocking I/O

### VII. Error Handling & Observability

- All exceptions MUST be caught by FastAPI exception handlers (global + per-domain where needed)
- Business logic errors MUST use custom exception classes (not raw `HTTPException`)
- Structured logging MUST be used (structlog or loguru) with correlation IDs for request tracing
- All critical operations MUST emit logs with sufficient context for debugging
- Health check endpoints (`/health`, `/ready`) MUST be implemented
- Application metrics SHOULD be exposed for monitoring (request latency, error rates, queue depth)

### VIII. Code Organization & Style

- Ruff MUST be configured for linting AND formatting (replaces flake8, isort, black)
- Import order MUST be consistent: stdlib -> third-party -> local (enforced by ruff)
- No business logic in routers; routers MUST only handle HTTP concerns (parsing, validation, response formatting)
- Services MUST contain business logic; repositories handle data access
- Configuration MUST use Pydantic `BaseSettings` with `.env` file support
- Environment-specific values MUST NEVER be hardcoded; use environment variables
- All Python code MUST follow PEP 8 conventions (enforced by ruff)

### IX. Dependency Management

- Dependencies MUST be managed with uv or Poetry (not pip directly)
- `pyproject.toml` MUST be the single source of truth for project metadata and dependencies
- Dependencies MUST be pinned to specific versions in the lock file
- Dev dependencies MUST be separated from production dependencies
- Virtual environments MUST be used (never install globally)

### X. Frontend Standards (React + shadcn/ui + Redux)

- The frontend MUST use React 18+ with TypeScript strict mode and functional components exclusively
- UI components MUST use shadcn/ui as the primary component library, built on Radix UI primitives
- Styling MUST use Tailwind CSS utility classes; arbitrary values (e.g., `h-[600px]`) are DISCOURAGED — use Tailwind's design tokens
- shadcn/ui components MUST be imported from `@/components/ui/*` and customized via Tailwind, NOT by overriding internal styles
- Custom UI components MUST compose shadcn/ui primitives rather than building from scratch (e.g., use `<Dialog>`, `<Sheet>`, `<DropdownMenu>` from shadcn)
- State management MUST use Redux Toolkit (`@reduxjs/toolkit`) for global/shared state
- Redux slices MUST be organized by feature/domain (e.g., `authSlice`, `ordersSlice`, `uiSlice`)
- RTK Query MUST be used for all API data fetching and caching (replaces manual fetch + useEffect patterns)
- Local component state (`useState`) MUST be used for UI-only state (modals, form inputs, toggles) — do NOT put ephemeral UI state in Redux
- Forms MUST use React Hook Form with Zod validation schemas; shadcn/ui form components (`<Form>`, `<FormField>`, `<FormItem>`) MUST be used for form layout
- Icons MUST use Lucide React (`lucide-react`) — the default icon set for shadcn/ui
- Routing MUST use React Router v6+ with typed route parameters
- All pages MUST handle loading, error, and empty states using consistent patterns (skeletons via shadcn `<Skeleton>`, error boundaries, empty state components)
- Responsive design MUST be implemented using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- Dark mode MUST be supported using shadcn/ui's built-in theme system (CSS variables + `dark:` Tailwind variant)
- Accessibility (WCAG 2.1 AA) is built into shadcn/ui's Radix primitives but MUST be verified for custom components
- Bundle optimization: lazy-load routes with `React.lazy()` + `Suspense`, use tree-shaking for all imports

### XI. Infrastructure & Deployment

- Application MUST be containerized with Docker (multi-stage builds for production)
- Environment configuration MUST follow 12-factor app principles
- CI/CD pipeline MUST run lint, type-check, and tests before deployment
- Database migrations MUST run automatically during deployment
- Zero-downtime deployments MUST be supported (health checks, graceful shutdown)
- ASGI server MUST be uvicorn (with gunicorn as process manager in production)

## Architectural Decision Requirements

- Every feature spec MUST reference `shared/architectural-decisions-guide.md`
- Caching, queues, streaming, and background jobs MUST be explicitly evaluated and justified
- Infrastructure additions MUST include monitoring and failure handling plans
- See `shared/architectural-decisions-guide.md` for detailed criteria

## Non-Negotiable Testing Quality Gates

- Required suites on every pull request: frontend component tests, frontend integration tests, frontend E2E tests, backend unit tests, backend integration tests, backend E2E tests, and API contract tests.
- Coverage thresholds enforced in CI: backend lines >= 85%, backend branches >= 75%, frontend lines >= 80%, frontend branches >= 70%, and changed lines coverage >= 90%.
- Contract tests MUST fail on backward-incompatible API schema or error-shape changes unless explicitly versioned and approved.
- Flaky tests are release blockers: quarantine within 24 hours, assign owner, and fix before release; critical-path flaky tests MUST block merge.
- Test data MUST be deterministic: seeded fixtures, isolated databases/environments, fixed clocks where required, and no reliance on shared mutable state.
- Release gate: no production release is allowed until all required suites pass in CI for the release commit and all critical user journeys have passing E2E evidence.

## Governance

- This constitution supersedes all other development practices
- Amendments require: documented rationale, team review, migration plan for existing code
- All code reviews MUST verify compliance with these principles
- Exceptions MUST be documented inline with justification

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
