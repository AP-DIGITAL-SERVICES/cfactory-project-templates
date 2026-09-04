# Quickstart: [PROJECT_NAME] — Mobile + FastAPI

## Prerequisites

### API Backend
- Python 3.12+ (`python3 --version`)
- [uv / Poetry] (`uv --version` / `poetry --version`)
- Docker + Docker Compose (`docker --version`)
- PostgreSQL 16+ (via Docker or local)
- [Redis 7+ — if caching/queues are used]

### Mobile App
- [React Native: Node.js 20+, Watchman, CocoaPods (iOS)]
- [Flutter: Flutter SDK 3.x, Dart SDK]
- [Native: Xcode 15+ (iOS), Android Studio Hedgehog+ (Android)]
- iOS Simulator / Android Emulator or physical device
- Git (`git --version`)

## 1. Clone & Install

```bash
git clone [REPO_URL]
cd [PROJECT_NAME]

# API dependencies
cd api
uv sync
# or
poetry install

# Mobile dependencies
cd ../mobile
pnpm install       # React Native
# or
flutter pub get    # Flutter

# If React Native, install iOS pods
cd ios && pod install && cd ..
```

## 2. Environment Setup

```bash
# API environment
cp api/.env.example api/.env
# Edit api/.env:
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/[PROJECT_NAME]_dev
# JWT_SECRET=your-dev-secret-at-least-32-chars
# REDIS_URL=redis://localhost:6379  (if applicable)
# FCM_SERVICE_ACCOUNT=path/to/firebase-service-account.json
# ENVIRONMENT=development
# DEBUG=true

# Mobile environment
cp mobile/.env.example mobile/.env
# Edit mobile/.env:
# API_URL=http://localhost:8000/api/v1      (iOS simulator)
# API_URL=http://10.0.2.2:8000/api/v1       (Android emulator)
# API_URL=http://<your-ip>:8000/api/v1      (physical device)
```

## 3. Start Infrastructure

```bash
# Start PostgreSQL (and Redis if applicable) via Docker
docker-compose up -d postgres redis
```

## 4. Database Setup

```bash
cd api

# Create the database (if not exists)
createdb [PROJECT_NAME]_dev

# Run Alembic migrations
uv run alembic upgrade head
# or
poetry run alembic upgrade head

# (Optional) Seed development data
uv run python -m src.seed
```

## 5. Run the Application

### API Backend

```bash
cd api

# Development mode (hot reload)
uv run uvicorn src.main:app --reload --port 8000

# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
# ReDoc at http://localhost:8000/redoc
# Health check at http://localhost:8000/health
```

### Mobile App

#### React Native

```bash
cd mobile

# Start Metro bundler
pnpm start

# Run on iOS (separate terminal)
pnpm ios
# or specify simulator
pnpm ios --simulator="iPhone 15 Pro"

# Run on Android (separate terminal)
pnpm android
```

#### Flutter

```bash
cd mobile

# List available devices
flutter devices

# Run on device
flutter run -d [device_id]
```

### Full API Stack (Docker)

```bash
docker-compose up
# API: http://localhost:8000
# PostgreSQL: localhost:5432
# Redis: localhost:6379 (if applicable)
```

## 6. Run Tests

```bash
# API tests
cd api
uv run pytest                              # All tests
uv run pytest tests/unit/                  # Unit tests
uv run pytest tests/integration/           # Integration tests
uv run pytest --cov=src --cov-report=html  # Coverage

# Mobile tests (React Native)
cd mobile
pnpm test                # Jest unit tests
pnpm test:e2e            # Detox E2E tests

# Mobile tests (Flutter)
cd mobile
flutter test                        # Unit + widget tests
flutter test integration_test/      # Integration tests
```

## 7. Code Quality

```bash
# API
cd api
uv run ruff check .         # Lint
uv run ruff format .        # Format
uv run mypy src/            # Type check

# Mobile (React Native)
cd mobile
pnpm lint                   # ESLint
pnpm typecheck              # TypeScript check

# Mobile (Flutter)
cd mobile
flutter analyze             # Dart analyzer
dart format .               # Format
```

## 8. Common Tasks

### Create an Alembic Migration

```bash
cd api
uv run alembic revision --autogenerate -m "description"
uv run alembic upgrade head
uv run alembic downgrade -1
```

### Add a New Domain Module

```bash
cd api/src
mkdir [domain]
touch [domain]/__init__.py [domain]/router.py [domain]/service.py
touch [domain]/schemas.py [domain]/models.py [domain]/repository.py

# Register in src/main.py:
# app.include_router([domain].router, prefix="/api/v1/[domain]")
```

### Build for Production

```bash
# API
cd api && uv run ruff check . && uv run mypy src/

# Mobile (React Native)
cd mobile
npx react-native build-ios --mode Release
cd android && ./gradlew assembleRelease

# Mobile (Flutter)
cd mobile
flutter build ios --release
flutter build appbundle --release

# Docker
docker-compose -f docker-compose.prod.yml build
```

### Test Push Notifications (Development)

```bash
curl -X POST http://localhost:8000/api/v1/test/push \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Test notification"}'
```

## 9. Project URLs

| Service | URL | Notes |
|---------|-----|-------|
| API | http://localhost:8000/api/v1 | FastAPI backend |
| Swagger UI | http://localhost:8000/docs | Interactive API docs |
| ReDoc | http://localhost:8000/redoc | Alternative docs |
| Health Check | http://localhost:8000/health | Health endpoint |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache/Queue (if applicable) |
| Metro Bundler | http://localhost:8081 | React Native dev server |

## 10. Mobile Development Tips

| Scenario | Solution |
|----------|----------|
| iOS simulator can't reach API | Use `http://localhost:8000` |
| Android emulator can't reach API | Use `http://10.0.2.2:8000` |
| Physical device can't reach API | Use your machine's LAN IP |
| Push notifications on simulator | iOS: simulated via Xcode; Android: works with FCM |
| Deep link testing | `npx uri-scheme open myapp://orders/123 --ios` |
| Debug network requests | Use Flipper or React Native Debugger |

## 11. Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | `lsof -i :8000` and kill the process |
| Database connection refused | Ensure PostgreSQL is running: `docker-compose ps` |
| Migration fails | Check DATABASE_URL uses `postgresql+asyncpg://` prefix |
| Import errors | Ensure venv activated: `source .venv/bin/activate` or use `uv run` |
| Redis connection refused | Ensure Redis running or remove REDIS_URL from .env |
| React Native build fails | `cd ios && pod install` (iOS) or `./gradlew clean` (Android) |
| Flutter build fails | `flutter clean && flutter pub get` |
| Alembic target not found | Run `uv run alembic heads` to check current state |
