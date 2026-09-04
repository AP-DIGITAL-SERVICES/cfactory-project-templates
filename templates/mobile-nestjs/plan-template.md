# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Summary

[Copy from spec.md → Business Proposition. Describe WHO benefits, WHAT they can do, and WHY it matters. Do NOT add technical details — those belong in Technical Context below.]

## Technical Context

### API Backend

**Language/Version**: TypeScript 5.x (strict mode)
**Runtime**: Node.js 20+
**Backend Framework**: NestJS 10+
**ORM**: [TypeORM 0.3+ / Prisma 5+ — choose one]
**Database**: PostgreSQL 16+
**Cache**: [Redis 7+ / None — justify per architectural-decisions-guide.md]
**Queue**: [BullMQ / None — justify per architectural-decisions-guide.md]
**Push Notifications**: [Firebase Cloud Messaging (FCM) / Apple Push Notification Service (APNs)]
**Testing**: Jest + Supertest
**Package Manager**: [pnpm / yarn — choose one]
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

- [ ] TypeScript strict mode enabled
- [ ] Module boundaries defined
- [ ] DTOs with class-validator for all endpoints
- [ ] Swagger decorators for all endpoints
- [ ] API versioning configured (`/v1/`)
- [ ] Idempotency support for write operations
- [ ] Cursor-based pagination implemented
- [ ] Jest + Supertest test setup
- [ ] Exception filters configured
- [ ] Structured logging with correlation IDs
- [ ] Health checks implemented
- [ ] Push notification service configured
- [ ] Docker multi-stage build

### Mobile

- [ ] Typed API response models matching DTOs
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
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/
│   │   ├── decorators/            # Custom decorators (IdempotencyKey, CurrentUser)
│   │   ├── filters/               # Exception filters
│   │   ├── guards/                # Auth guards
│   │   ├── interceptors/          # Logging, transform, cache interceptors
│   │   ├── pipes/                 # Custom validation pipes
│   │   ├── dto/                   # Shared DTOs (pagination, errors)
│   │   └── interfaces/
│   ├── config/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/            # JWT, refresh token strategies
│   │   ├── guards/
│   │   └── dto/
│   ├── users/
│   ├── notifications/             # Push notification module
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   ├── providers/             # FCM, APNs providers
│   │   └── dto/
│   ├── devices/                   # Device registration module
│   │   ├── devices.module.ts
│   │   ├── devices.controller.ts
│   │   ├── devices.service.ts
│   │   └── dto/
│   ├── health/
│   └── [feature-modules]/
├── test/
├── prisma/ or migrations/
├── nest-cli.json
├── tsconfig.json
├── .env.example
├── Dockerfile
└── package.json

mobile/                            # Or ios/ + android/ for native
├── # React Native structure:
├── src/
│   ├── app/                       # App entry, navigation, providers
│   │   ├── App.tsx
│   │   ├── navigation/            # Navigation stack definitions
│   │   └── providers/             # Auth, theme, query providers
│   ├── features/                  # Feature-based modules
│   │   └── [feature]/
│   │       ├── screens/           # Screen components
│   │       ├── components/        # Feature-specific components
│   │       ├── hooks/             # Feature-specific hooks
│   │       ├── services/          # API call functions
│   │       ├── stores/            # Feature state (Zustand slices)
│   │       └── types/             # Feature-specific types
│   ├── components/                # Shared/reusable components
│   │   ├── ui/                    # Design system primitives
│   │   └── layout/                # Layout components
│   ├── services/                  # Shared API client, storage
│   │   ├── api/                   # API client, interceptors
│   │   ├── storage/               # Secure storage, local DB
│   │   └── notifications/         # Push notification handler
│   ├── hooks/                     # Shared custom hooks
│   ├── types/                     # Shared types (API responses)
│   ├── utils/                     # Utility functions
│   ├── constants/                 # App constants, config
│   └── theme/                     # Colors, typography, spacing
├── __tests__/                     # Unit tests
├── e2e/                           # Detox/Maestro E2E tests
├── android/
├── ios/
├── app.json
├── metro.config.js
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
│   │       ├── presentation/      # Screens, widgets
│   │       ├── domain/            # Models, use cases
│   │       └── data/              # Repositories, data sources
│   ├── core/                      # Shared utilities, themes
│   └── services/                  # API, storage, notifications
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

**Structure Decision**: Mobile + API with separate directories. [Monorepo / Separate repos — document choice].

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

- **Decision**: [YES with Redis / NO]
- **Justification**: [Reference architectural guide]
- **Implementation**: [Technology, TTL, invalidation]

### Message Queues

- **Decision**: [YES with BullMQ / NO]
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
- **Implementation**: [Socket.IO / native WebSocket / SSE / polling interval]

### Background Jobs

- **Decision**: [YES / NO]
- **Justification**: [Reference architectural guide]
- **Implementation**: [Technology, job types]

### File Storage

- **Decision**: [YES with S3 / NO]
- **Justification**: [Reference architectural guide]
- **Implementation**: [Pre-signed URLs for direct mobile upload]
