# {{projectName}} Constitution — Web Application + NestJS API

## Core Principles

### I. Modular Architecture

- The backend MUST follow NestJS module boundaries: each domain has its own module with controllers, services, and DTOs
- Modules MUST be self-contained and independently testable
- Cross-module communication MUST go through well-defined service interfaces, never direct repository access
- Circular dependencies between modules are FORBIDDEN; use forwardRef() only as a last resort with documented justification
- The frontend MUST organize code by feature/domain, not by file type

### II. Type Safety (NON-NEGOTIABLE)

- TypeScript strict mode MUST be enabled in both backend and frontend (`"strict": true`)
- `any` type is FORBIDDEN except in rare, documented cases with a `// eslint-disable` comment explaining why
- All API request/response shapes MUST be defined as DTOs (backend) and types/interfaces (frontend)
- DTOs MUST use `class-validator` decorators for runtime validation
- Database entities MUST have complete type definitions; no implicit `any` through ORM relations

### III. API Design

- All endpoints MUST follow RESTful conventions (proper HTTP verbs, status codes, resource naming)
- All endpoints MUST be documented via `@nestjs/swagger` decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- Request validation MUST use `ValidationPipe` globally with `whitelist: true` and `forbidNonWhitelisted: true`
- Pagination MUST use cursor-based or offset-based pagination consistently (choose one, document in plan)
- Error responses MUST follow a consistent structure: `{ statusCode, message, error, details? }`
- API versioning strategy MUST be defined in the plan (URI versioning `/v1/` or header-based)

### IV. Test-First Development

- Unit tests MUST be written for all services and utility functions using Jest
- Integration tests MUST be written for all controller endpoints using `@nestjs/testing` + Supertest
- End-to-end tests MUST cover critical user journeys
- Frontend components MUST have tests using the project's chosen testing library (Vitest, Jest, or Testing Library)
- Minimum test coverage target: 80% for services, 70% for controllers, 60% for frontend components
- Tests MUST NOT depend on external services; use mocks and test fixtures

### V. Security

- Authentication MUST use JWT with short-lived access tokens and refresh token rotation
- Authorization MUST use NestJS Guards with role/permission-based access control
- All user input MUST be validated and sanitized before processing
- Sensitive data (passwords, tokens) MUST NEVER appear in logs, error messages, or API responses
- CORS MUST be configured with explicit allowed origins (no wildcard `*` in production)
- Rate limiting MUST be applied to authentication endpoints and public APIs
- Helmet middleware MUST be enabled for HTTP security headers
- CSRF protection MUST be evaluated and implemented if using cookie-based auth

### VI. Database & Data Access

- Database access MUST go through the ORM (TypeORM or Prisma); raw SQL is allowed only for complex queries with documented justification
- All schema changes MUST use migrations; never modify the database manually
- Migrations MUST be reversible (include both `up` and `down`)
- Soft deletes MUST be used for user-facing data; hard deletes only for system/temporary data
- All queries MUST be optimized: no N+1 queries, proper indexing, query analysis for complex joins
- Database transactions MUST be used for multi-table write operations

### VII. Error Handling & Observability

- All exceptions MUST be caught by NestJS Exception Filters (global + per-module where needed)
- Business logic errors MUST use custom exception classes extending `HttpException`
- Structured logging MUST be used (Winston or Pino) with correlation IDs for request tracing
- All critical operations MUST emit logs with sufficient context for debugging
- Health check endpoints (`/health`, `/ready`) MUST be implemented using `@nestjs/terminus`
- Application metrics SHOULD be exposed for monitoring (request latency, error rates, queue depth)

### VIII. Code Organization & Style

- ESLint + Prettier MUST be configured and enforced via pre-commit hooks
- Import order MUST be consistent: external libs -> internal modules -> relative imports
- No business logic in controllers; controllers MUST only handle HTTP concerns (parsing, validation, response formatting)
- Services MUST contain business logic; repositories/ORM handle data access
- Configuration MUST use `@nestjs/config` with validation via Joi or class-validator
- Environment-specific values MUST NEVER be hardcoded; use environment variables

### IX. Frontend Standards (React + shadcn/ui + Redux)

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

### X. Infrastructure & Deployment

- Application MUST be containerized with Docker (multi-stage builds for production)
- Environment configuration MUST follow 12-factor app principles
- CI/CD pipeline MUST run lint, type-check, and tests before deployment
- Database migrations MUST run automatically during deployment
- Zero-downtime deployments MUST be supported (health checks, graceful shutdown)

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
