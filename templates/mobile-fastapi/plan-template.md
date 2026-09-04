# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Summary

[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

### API Backend

**Language/Version**: Python 3.12+
**Backend Framework**: FastAPI 0.110+
**ASGI Server**: uvicorn (+ gunicorn for production)
**ORM**: [SQLAlchemy 2.0+ (async) / Tortoise-ORM — choose one]
**Migration Tool**: Alembic
**Database**: PostgreSQL 16+ (asyncpg driver)
**Cache**: [Redis 7+ / None — justify per architectural-decisions-guide.md]
**Queue**: [Celery + Redis / arq / None — justify per architectural-decisions-guide.md]
**Push Notifications**: [Firebase Cloud Messaging (FCM) / Apple Push Notification Service (APNs)]
**Testing**: pytest + httpx
**Package Manager**: [uv / Poetry — choose one]
**Linting/Formatting**: Ruff
**Type Checking**: mypy or pyright (strict mode)
**Containerization**: Docker + docker-compose

### Mobile Application

**Framework**: [React Native 0.73+ / Flutter 3.x / Native (Swift + Kotlin) — choose one]
**Min iOS Version**: iOS 16+
**Min Android Version**: Android 13+ (API 33)
**State Management**: [React Native: Zustand/Redux Toolkit / Flutter: Riverpod/BLoC / Native: platform patterns]
**Local Storage**: [React Native: MMKV/WatermelonDB / Flutter: Hive/Drift / Native: CoreData/Room]
**Navigation**: [React Navigation / go_router / UIKit+SwiftUI / Jetpack Compose Navigation]
**Networking**: [React Native: axios/ky / Flutter: dio / Native: URLSession/Retrofit]
**Testing**: [React Native: Jest+Detox / Flutter: flutter_test+integration_test / Native: XCTest+Espresso]

### Shared

**CI/CD**: GitHub Actions
**Target Platforms**: iOS 16+, Android 13+, Linux server (API)
**Performance Goals**: [e.g., < 500ms API p95, 60fps mobile UI, < 3s cold start]
**Constraints**: [e.g., offline support required, < 50MB app size, battery efficiency]
**Scale/Scope**: [e.g., 10K users, 30 API endpoints, 15 mobile screens]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### API

- [ ] Python type hints on all signatures
- [ ] Pydantic v2 models for all request/response
- [ ] mypy/pyright strict mode passes
- [ ] Ruff configured for linting + formatting
- [ ] API versioning configured (`/v1/`)
- [ ] Idempotency support for write operations
- [ ] Cursor-based pagination implemented
- [ ] pytest + httpx test setup
- [ ] Global exception handlers configured
- [ ] Structured logging with correlation IDs
- [ ] Health checks implemented
- [ ] Push notification service configured
- [ ] Docker multi-stage build

### Mobile

- [ ] Typed API response models matching Pydantic schemas
- [ ] Offline state handling for all screens
- [ ] Loading/error/empty states for all data screens
- [ ] Deep linking configured
- [ ] Push notification handling
- [ ] Secure token storage (Keychain/Keystore)
- [ ] Accessibility basics (labels, dynamic text)

### Architectural

- [ ] Caching decisions documented
- [ ] Queue decisions documented
- [ ] Push notification strategy documented
- [ ] Offline sync strategy documented

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
api/
├── src/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app factory
│   ├── config.py                  # Pydantic BaseSettings
│   ├── database.py                # Async engine, session factory
│   ├── dependencies.py            # Shared FastAPI dependencies
│   ├── exceptions.py              # Custom exception classes
│   ├── middleware.py               # CORS, logging, correlation ID
│   ├── common/
│   │   ├── __init__.py
│   │   ├── schemas.py             # Shared Pydantic models (pagination, errors)
│   │   ├── security.py            # JWT, password hashing
│   │   └── utils.py
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── schemas.py
│   │   ├── dependencies.py        # get_current_user, require_roles
│   │   └── models.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   └── repository.py
│   ├── notifications/             # Push notification domain
│   │   ├── __init__.py
│   │   ├── service.py
│   │   ├── providers/             # FCM, APNs providers
│   │   └── schemas.py
│   ├── devices/                   # Device registration
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   └── repository.py
│   ├── health/
│   │   ├── __init__.py
│   │   └── router.py
│   └── [domain]/
├── tests/
│   ├── conftest.py
│   ├── factories.py
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── alembic/
│   ├── env.py
│   └── versions/
├── pyproject.toml
├── .env.example
├── Dockerfile
└── ruff.toml

mobile/
├── # React Native structure:
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── navigation/
│   │   └── providers/
│   ├── features/
│   │   └── [feature]/
│   │       ├── screens/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── stores/
│   │       └── types/
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── services/
│   │   ├── api/
│   │   ├── storage/
│   │   └── notifications/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── theme/
├── __tests__/
├── e2e/
├── android/
├── ios/
├── app.json
├── tsconfig.json
├── .env.example
└── package.json
│
├── # Flutter structure (alternative):
├── lib/
│   ├── main.dart
│   ├── app/
│   ├── features/
│   │   └── [feature]/
│   │       ├── presentation/
│   │       ├── domain/
│   │       └── data/
│   ├── core/
│   └── services/
├── test/
├── integration_test/
└── pubspec.yaml

docker-compose.yml
.github/
└── workflows/
    ├── ci-api.yml
    ├── ci-mobile.yml
    └── deploy-api.yml
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| | | |

## Implementation Phases

### Phase 0: Research
- [ ] Investigate library compatibility
- [ ] Evaluate offline sync strategy
- [ ] Review push notification implementation options
- [ ] Document findings in `research.md`

### Phase 1: Design
- [ ] Define data model in `data-model.md`
- [ ] Define API contracts in `contracts/`
- [ ] Define project quickstart in `quickstart.md`
- [ ] Define mobile screen wireframes / flow
- [ ] Validate design against constitution

### Phase 2: Task Breakdown
- [ ] Generate `tasks.md`

### Phase 3-N: Implementation
- [ ] Execute tasks per `tasks.md`
- [ ] Validate each user story checkpoint independently

## Architectural Decisions

### Caching

- **Decision**: [YES with Redis / YES with in-memory / NO]
- **Justification**: [Reference architectural guide]
- **Implementation**: [Technology, TTL, invalidation]

### Message Queues

- **Decision**: [YES with Celery + Redis / YES with arq / NO]
- **Justification**: [Reference architectural guide]
- **Implementation**: [Technology, use cases (push notifications, email)]

### Push Notifications

- **Decision**: YES (required for mobile)
- **Provider**: [FCM for Android + iOS / FCM + APNs direct]
- **Trigger patterns**: [Queue-based / Direct from service / Event-driven]
- **Failure handling**: [Retry policy, token cleanup for invalid tokens]
- **Topics/Channels**: [List notification categories]

### Offline Support

- **Level**: [None / Read-only cache / Full offline-first with sync]
- **Justification**: [Which features need offline support and why]
- **Local storage**: [MMKV/WatermelonDB/Hive/Drift/CoreData/Room]
- **Sync strategy**: [Pull on reconnect / Delta sync / Conflict resolution approach]

### Real-Time Updates

- **Decision**: [YES with WebSocket / YES with SSE / YES with polling / NO]
- **Justification**: [Which features need real-time and why]
- **Implementation**: [python-socketio / SSE / polling interval]

### Background Jobs

- **Decision**: [YES with Celery Beat / YES with APScheduler / YES with arq cron / NO]
- **Justification**: [Reference architectural guide]

### File Storage

- **Decision**: [YES with S3 (boto3) / NO]
- **Justification**: [Reference architectural guide]
- **Implementation**: [Pre-signed URLs for direct mobile upload]
