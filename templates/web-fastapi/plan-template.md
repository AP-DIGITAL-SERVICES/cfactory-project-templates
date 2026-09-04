# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Summary

[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

**Language/Version**: Python 3.12+
**Backend Framework**: FastAPI 0.110+
**ASGI Server**: uvicorn (+ gunicorn for production)
**Frontend Framework**: [React 18+ / Next.js 14+ / Vue 3+ / Nuxt 3+ — choose one]
**ORM**: [SQLAlchemy 2.0+ (async) / Tortoise-ORM — choose one]
**Migration Tool**: Alembic
**Database**: PostgreSQL 16+ (asyncpg driver)
**Cache**: [Redis 7+ / None — justify per architectural-decisions-guide.md]
**Queue**: [Celery + Redis / arq / None — justify per architectural-decisions-guide.md]
**Testing**: pytest + httpx (backend), [Vitest / Jest] + Testing Library (frontend)
**Package Manager**: [uv / Poetry — choose one]
**Linting/Formatting**: Ruff
**Type Checking**: mypy or pyright (strict mode)
**Containerization**: Docker + docker-compose
**CI/CD**: GitHub Actions
**Target Platform**: Linux server (containerized)
**Performance Goals**: [e.g., < 200ms p95 API response, 60fps frontend rendering]
**Constraints**: [e.g., < 512MB memory per container, async-first]
**Scale/Scope**: [e.g., 10K users, 50 API endpoints, 20 frontend pages]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] Python type hints on all signatures
- [ ] Pydantic v2 models for all request/response
- [ ] mypy/pyright strict mode passes
- [ ] Ruff configured for linting + formatting
- [ ] pytest + httpx test setup
- [ ] Global exception handlers configured
- [ ] Structured logging configured (structlog/loguru)
- [ ] Health checks implemented
- [ ] Docker multi-stage build
- [ ] Architectural decisions documented (caching, queues, etc.)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app factory
│   ├── config.py                  # Pydantic BaseSettings
│   ├── database.py                # Async engine, session factory
│   ├── dependencies.py            # Shared FastAPI dependencies
│   ├── exceptions.py              # Custom exception classes
│   ├── middleware.py               # CORS, logging, correlation ID
│   ├── common/                    # Shared utilities
│   │   ├── __init__.py
│   │   ├── schemas.py             # Shared Pydantic models (pagination, errors)
│   │   ├── security.py            # JWT, password hashing utilities
│   │   └── utils.py               # General utilities
│   ├── auth/                      # Authentication domain
│   │   ├── __init__.py
│   │   ├── router.py              # Auth endpoints
│   │   ├── service.py             # Auth business logic
│   │   ├── schemas.py             # Auth Pydantic models
│   │   ├── dependencies.py        # Auth-specific dependencies (get_current_user)
│   │   └── models.py              # Auth SQLAlchemy models (refresh tokens)
│   ├── users/                     # Example domain
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   └── repository.py          # Data access layer
│   ├── [domain]/                  # Additional domain packages
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   └── repository.py
│   └── health/                    # Health check
│       ├── __init__.py
│       └── router.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # Shared fixtures, test DB setup
│   ├── factories.py               # Test data factories
│   ├── unit/                      # Unit tests (services)
│   ├── integration/               # Integration tests (routers)
│   └── e2e/                       # End-to-end tests
├── alembic/
│   ├── env.py
│   ├── versions/                  # Migration files
│   └── alembic.ini
├── pyproject.toml                 # Dependencies, tool config
├── .env.example
├── Dockerfile
└── ruff.toml                      # Linter/formatter config

frontend/
├── src/
│   ├── components/                # Shared/reusable components
│   │   ├── ui/                    # Design system primitives
│   │   └── layout/                # Layout components
│   ├── features/                  # Feature-based modules
│   │   └── [feature]/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   ├── pages/                     # Route-level components
│   ├── services/                  # Shared API client, HTTP utilities
│   ├── stores/                    # Global state management
│   ├── hooks/                     # Shared custom hooks
│   ├── types/                     # Shared TypeScript types
│   ├── utils/                     # Utility functions
│   └── styles/                    # Global styles, themes
├── public/                        # Static assets
├── tests/
├── tsconfig.json
├── .env.example
├── Dockerfile
└── package.json

docker-compose.yml                 # Local development stack
docker-compose.prod.yml            # Production-like stack
.github/
└── workflows/
    ├── ci.yml                     # Lint, type-check, test
    └── deploy.yml                 # Build, push, deploy
```

**Structure Decision**: Web application with separate backend (FastAPI) and frontend directories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| | | |

## Implementation Phases

### Phase 0: Research

- [ ] Investigate library compatibility for chosen stack
- [ ] Review existing patterns in codebase (if extending)
- [ ] Document findings in `research.md`

### Phase 1: Design

- [ ] Define data model in `data-model.md`
- [ ] Define API contracts in `contracts/`
- [ ] Define project quickstart in `quickstart.md`
- [ ] Validate design against constitution

### Phase 2: Task Breakdown

- [ ] Generate `tasks.md` using spec + plan + data model + contracts

### Phase 3-N: Implementation

- [ ] Execute tasks per `tasks.md`
- [ ] Validate each user story checkpoint independently

## Architectural Decisions

<!--
  Reference: shared/architectural-decisions-guide.md
  Document each decision with justification.
-->

### Caching

- **Decision**: [YES with Redis / YES with in-memory (cachetools) / NO]
- **Justification**: [Reference specific criteria from architectural guide]
- **Implementation**: [Cache layer, TTL strategy, invalidation approach]

### Message Queues

- **Decision**: [YES with Celery + Redis / YES with arq / YES with SQS / NO]
- **Justification**: [Reference specific criteria from architectural guide]
- **Implementation**: [Queue technology, retry policy, DLQ setup]

### Event Streaming

- **Decision**: [YES with Redis Streams / YES with Kafka / NO]
- **Justification**: [Reference specific criteria from architectural guide]
- **Implementation**: [Stream technology, consumer groups, retention]

### Background Jobs

- **Decision**: [YES with Celery Beat / YES with APScheduler / YES with arq cron / NO]
- **Justification**: [Reference specific criteria from architectural guide]
- **Implementation**: [Job scheduler, distributed locking, monitoring]

### Search

- **Decision**: [YES with Meilisearch / YES with PostgreSQL FTS / NO]
- **Justification**: [Reference specific criteria from architectural guide]

### File Storage

- **Decision**: [YES with S3 (boto3) / YES with local / NO]
- **Justification**: [Reference specific criteria from architectural guide]
