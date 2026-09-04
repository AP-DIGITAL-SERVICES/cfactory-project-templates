# Quickstart: [PROJECT_NAME] — Mobile + NestJS API

## Prerequisites

### API Backend
- Node.js 20+ (`node -v`)
- [pnpm / yarn] (`pnpm -v` / `yarn -v`)
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
pnpm install

# Mobile dependencies
cd ../mobile
pnpm install       # React Native
# or
flutter pub get    # Flutter
# or
cd ios && pod install && cd ..  # React Native iOS

# If React Native, install iOS pods
cd ios && pod install && cd ..
```

## 2. Environment Setup

```bash
# API environment
cp api/.env.example api/.env
# Edit api/.env:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/[PROJECT_NAME]_dev
# JWT_SECRET=your-dev-secret-at-least-32-chars
# REDIS_URL=redis://localhost:6379  (if applicable)
# FCM_SERVICE_ACCOUNT=path/to/firebase-service-account.json
# PORT=3000

# Mobile environment
cp mobile/.env.example mobile/.env
# Edit mobile/.env:
# API_URL=http://localhost:3000/api         (iOS simulator)
# API_URL=http://10.0.2.2:3000/api          (Android emulator)
# API_URL=http://<your-ip>:3000/api         (physical device)
```

## 3. Start Infrastructure

```bash
# Start PostgreSQL (and Redis if applicable) via Docker
docker-compose up -d postgres redis
```

## 4. Database Setup

```bash
cd api

# Run migrations
pnpm migration:run

# (Optional) Seed development data
pnpm seed
```

## 5. Run the Application

### API Backend

```bash
cd api

# Development mode (hot reload)
pnpm start:dev

# API runs at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
# Health check at http://localhost:3000/health
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

# Run on iOS simulator
flutter run -d [device_id]

# Run on Android emulator
flutter run -d [device_id]

# Run with hot reload
flutter run  # Press 'r' for hot reload, 'R' for hot restart
```

### Full API Stack (Docker)

```bash
# Run API + infrastructure via Docker Compose
docker-compose up

# API: http://localhost:3000
# PostgreSQL: localhost:5432
# Redis: localhost:6379 (if applicable)
```

## 6. Run Tests

```bash
# API tests
cd api
pnpm test                # Unit tests
pnpm test:e2e            # E2E tests
pnpm test:cov            # Coverage

# Mobile tests (React Native)
cd mobile
pnpm test                # Jest unit tests
pnpm test:e2e            # Detox E2E tests (requires built app)

# Mobile tests (Flutter)
cd mobile
flutter test             # Unit + widget tests
flutter test integration_test/  # Integration tests
```

## 7. Code Quality

```bash
# API
cd api
pnpm lint                # ESLint
pnpm typecheck           # TypeScript compiler check
pnpm format              # Prettier

# Mobile (React Native)
cd mobile
pnpm lint                # ESLint
pnpm typecheck           # TypeScript compiler check

# Mobile (Flutter)
cd mobile
flutter analyze          # Dart analyzer
dart format .            # Format code
```

## 8. Common Tasks

### Create a New NestJS Module (API)

```bash
cd api
npx nest generate module [module-name]
npx nest generate controller [module-name]
npx nest generate service [module-name]
```

### Create a Database Migration

```bash
cd api
pnpm migration:generate src/migrations/[MigrationName]
pnpm migration:run
pnpm migration:revert
```

### Build for Production

```bash
# API
cd api && pnpm build

# Mobile (React Native)
cd mobile
# iOS: Archive via Xcode or Fastlane
npx react-native build-ios --mode Release
# Android: Generate signed APK/AAB
cd android && ./gradlew assembleRelease

# Mobile (Flutter)
cd mobile
flutter build ios --release
flutter build appbundle --release
```

### Test Push Notifications (Development)

```bash
# Use Firebase Console or CLI to send test notifications
# Or use the API endpoint (requires auth):
curl -X POST http://localhost:3000/api/test/push \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Test notification"}'
```

## 9. Project URLs

| Service | URL | Notes |
|---------|-----|-------|
| API | http://localhost:3000/api | NestJS backend |
| Swagger Docs | http://localhost:3000/api/docs | API documentation |
| Health Check | http://localhost:3000/health | Health endpoint |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache/Queue (if applicable) |
| Metro Bundler | http://localhost:8081 | React Native dev server |

## 10. Mobile Development Tips

| Scenario | Solution |
|----------|----------|
| iOS simulator can't reach API | Use `http://localhost:3000` |
| Android emulator can't reach API | Use `http://10.0.2.2:3000` |
| Physical device can't reach API | Use your machine's LAN IP |
| Push notifications on simulator | iOS: simulated via Xcode; Android: works with FCM |
| Deep link testing | `npx uri-scheme open myapp://orders/123 --ios` |
| Debug network requests | Use Flipper or React Native Debugger |
| Slow Metro bundler | Clear cache: `pnpm start --reset-cache` |
| CocoaPods issues | `cd ios && pod deintegrate && pod install` |
| Android build fails | `cd android && ./gradlew clean` |

## 11. Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | `lsof -i :3000` and kill the process |
| Database connection refused | Ensure PostgreSQL is running: `docker-compose ps` |
| Migration fails | Check DATABASE_URL in .env |
| Module not found | Run `pnpm install` again |
| CORS errors | Not typical for mobile; check API config if using web debug tools |
| Redis connection refused | Ensure Redis is running or remove REDIS_URL from .env |
| React Native build fails | `cd ios && pod install` (iOS) or `./gradlew clean` (Android) |
| Flutter build fails | `flutter clean && flutter pub get` |
