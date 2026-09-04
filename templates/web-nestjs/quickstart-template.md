# Quickstart: [PROJECT_NAME] — Web + NestJS

## Prerequisites

- Node.js 20+ (`node -v`)
- [pnpm / yarn] (`pnpm -v` / `yarn -v`)
- Docker + Docker Compose (`docker --version`)
- PostgreSQL 16+ (via Docker or local installation)
- [Redis 7+ — only if caching/queues are used]
- Git (`git --version`)

## 1. Clone & Install

```bash
git clone [REPO_URL]
cd [PROJECT_NAME]

# Install dependencies
pnpm install
# or
yarn install
```

## 2. Environment Setup

```bash
# Copy environment template
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your local values:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/[PROJECT_NAME]_dev
# JWT_SECRET=your-dev-secret-at-least-32-chars
# REDIS_URL=redis://localhost:6379  (if applicable)
# PORT=3000

# Edit frontend/.env with your local values:
# VITE_API_URL=http://localhost:3000/api
```

## 3. Start Infrastructure

```bash
# Start PostgreSQL (and Redis if applicable) via Docker
docker-compose up -d postgres redis

# Or use local installations and skip this step
```

## 4. Database Setup

```bash
cd backend

# Run migrations
pnpm migration:run
# or with TypeORM CLI
npx typeorm migration:run -d src/config/data-source.ts

# (Optional) Seed development data
pnpm seed
```

## 5. Run the Application

### Backend

```bash
cd backend

# Development mode (hot reload)
pnpm start:dev

# Backend runs at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
# Health check at http://localhost:3000/health
```

### Frontend

```bash
cd frontend

# Development mode (hot reload)
pnpm dev

# Frontend runs at http://localhost:5173 (Vite default)
```

### Full Stack (Docker)

```bash
# Run everything via Docker Compose
docker-compose up

# Backend: http://localhost:3000
# Frontend: http://localhost:5173
# PostgreSQL: localhost:5432
# Redis: localhost:6379 (if applicable)
```

## 6. Run Tests

```bash
# Backend unit + integration tests
cd backend && pnpm test

# Backend e2e tests
cd backend && pnpm test:e2e

# Backend test coverage
cd backend && pnpm test:cov

# Frontend tests
cd frontend && pnpm test

# Frontend test coverage
cd frontend && pnpm test:cov
```

## 7. Code Quality

```bash
# Lint (backend + frontend)
pnpm lint

# Type check
pnpm typecheck

# Format code
pnpm format
```

## 8. Common Tasks

### Create a New Module (Backend)

```bash
cd backend
npx nest generate module [module-name]
npx nest generate controller [module-name]
npx nest generate service [module-name]
```

### Create a Database Migration

```bash
cd backend
# Auto-generate migration from entity changes
pnpm migration:generate src/migrations/[MigrationName]

# Create empty migration for manual SQL
pnpm migration:create src/migrations/[MigrationName]

# Revert last migration
pnpm migration:revert
```

### Build for Production

```bash
# Backend
cd backend && pnpm build

# Frontend
cd frontend && pnpm build

# Docker (full stack)
docker-compose -f docker-compose.prod.yml build
```

## 9. Project URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend (dev) | http://localhost:5173 | Vite dev server |
| Backend API | http://localhost:3000/api | NestJS API |
| Swagger Docs | http://localhost:3000/api/docs | Auto-generated API docs |
| Health Check | http://localhost:3000/health | Terminus health check |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache/Queue (if applicable) |

## 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | `lsof -i :3000` and kill the process, or change PORT in .env |
| Database connection refused | Ensure PostgreSQL is running: `docker-compose ps` |
| Migration fails | Check DATABASE_URL in .env, ensure DB exists |
| Module not found | Run `pnpm install` again, check tsconfig paths |
| CORS errors | Check `CORS_ORIGIN` in backend .env matches frontend URL |
| Redis connection refused | Ensure Redis is running or remove REDIS_URL from .env |
