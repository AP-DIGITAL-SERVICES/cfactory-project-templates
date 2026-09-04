# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Summary

[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Runtime**: Node.js 20+
**Backend Framework**: NestJS 10+
**Frontend Framework**: [React 18+ / Next.js 14+ / Vue 3+ / Nuxt 3+ — choose one]
**ORM**: [TypeORM 0.3+ / Prisma 5+ — choose one]
**Database**: PostgreSQL 16+
**Cache**: [Redis 7+ / None — justify per architectural-decisions-guide.md]
**Queue**: [BullMQ / None — justify per architectural-decisions-guide.md]
**Testing**: Jest + Supertest (backend), [Vitest / Jest] + Testing Library (frontend)
**Package Manager**: [pnpm / yarn — choose one]
**Containerization**: Docker + docker-compose
**CI/CD**: GitHub Actions
**Target Platform**: Linux server (containerized)
**Performance Goals**: [e.g., < 200ms p95 API response, 60fps frontend rendering]
**Constraints**: [e.g., < 512MB memory per container, offline not required]
**Scale/Scope**: [e.g., 10K users, 50 API endpoints, 20 frontend pages]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] TypeScript strict mode enabled
- [ ] Module boundaries defined
- [ ] DTOs with class-validator for all endpoints
- [ ] Swagger decorators for all endpoints
- [ ] Jest + Supertest test setup
- [ ] Exception filters configured
- [ ] Structured logging configured
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
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/                    # Shared utilities
│   │   ├── decorators/            # Custom decorators
│   │   ├── filters/               # Exception filters
│   │   ├── guards/                # Auth guards
│   │   ├── interceptors/          # Logging, transform interceptors
│   │   ├── pipes/                 # Custom validation pipes
│   │   ├── dto/                   # Shared DTOs (pagination, etc.)
│   │   └── interfaces/            # Shared interfaces/types
│   ├── config/                    # Configuration module
│   │   ├── config.module.ts
│   │   └── config.validation.ts   # Env var validation schema
│   ├── auth/                      # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/            # Passport strategies (JWT, local)
│   │   ├── guards/                # Auth-specific guards
│   │   └── dto/                   # Auth DTOs
│   ├── users/                     # Example domain module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/              # TypeORM entities or Prisma models
│   │   └── dto/                   # Request/response DTOs
│   ├── health/                    # Health check module
│   │   ├── health.module.ts
│   │   └── health.controller.ts
│   └── [feature-modules]/         # Additional domain modules
├── test/
│   ├── jest-e2e.json
│   └── app.e2e-spec.ts
├── prisma/                        # If using Prisma
│   ├── schema.prisma
│   └── migrations/
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── .env.example
├── Dockerfile
└── package.json

frontend/
├── src/
│   ├── components/                # Shared/reusable components
│   │   ├── ui/                    # Design system primitives
│   │   └── layout/                # Layout components
│   ├── features/                  # Feature-based modules
│   │   └── [feature]/
│   │       ├── components/        # Feature-specific components
│   │       ├── hooks/             # Feature-specific hooks (React)
│   │       ├── services/          # API call functions
│   │       └── types/             # Feature-specific types
│   ├── pages/                     # Route-level components
│   ├── services/                  # Shared API client, HTTP utilities
│   ├── stores/                    # Global state management
│   ├── hooks/                     # Shared custom hooks
│   ├── types/                     # Shared TypeScript types
│   ├── utils/                     # Utility functions
│   └── styles/                    # Global styles, themes
├── public/                        # Static assets
├── tests/                         # Test files (or co-located)
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

**Structure Decision**: Web application with separate backend (NestJS) and frontend directories. Monorepo managed by [pnpm workspaces / Nx / Turborepo — choose if applicable].

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

- **Decision**: [YES with Redis / YES with in-memory / NO]
- **Justification**: [Reference specific criteria from architectural guide]
- **Implementation**: [Cache layer, TTL strategy, invalidation approach]

### Message Queues

- **Decision**: [YES with BullMQ / YES with SQS / NO]
- **Justification**: [Reference specific criteria from architectural guide]
- **Implementation**: [Queue technology, retry policy, DLQ setup]

### Event Streaming

- **Decision**: [YES with Redis Streams / YES with Kafka / NO]
- **Justification**: [Reference specific criteria from architectural guide]
- **Implementation**: [Stream technology, consumer groups, retention]

### Background Jobs

- **Decision**: [YES with @nestjs/schedule / YES with BullMQ repeatable / NO]
- **Justification**: [Reference specific criteria from architectural guide]
- **Implementation**: [Job scheduler, distributed locking, monitoring]

### Search

- **Decision**: [YES with Meilisearch / YES with PostgreSQL FTS / NO]
- **Justification**: [Reference specific criteria from architectural guide]

### File Storage

- **Decision**: [YES with S3 / YES with local / NO]
- **Justification**: [Reference specific criteria from architectural guide]
