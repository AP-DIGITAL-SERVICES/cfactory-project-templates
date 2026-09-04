# Quickstart: [PROJECT_NAME] — Web + FastAPI

## Prerequisites

- Python 3.12+ (`python3 --version`)
- [uv / Poetry] (`uv --version` / `poetry --version`)
- Node.js 20+ (`node -v`)
- [pnpm / yarn] for frontend (`pnpm -v` / `yarn -v`)
- Docker + Docker Compose (`docker --version`)
- PostgreSQL 16+ (via Docker or local installation)
- [Redis 7+ — only if caching/queues are used]
- Git (`git --version`)

## 1. Clone & Install

```bash
git clone [REPO_URL]
cd [PROJECT_NAME]

# Backend dependencies
cd backend
uv sync
# or
poetry install

# Frontend dependencies
cd ../frontend
pnpm install
```

## 2. Environment Setup

```bash
# Copy environment template
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your local values:
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/[PROJECT_NAME]_dev
# JWT_SECRET=your-dev-secret-at-least-32-chars
# REDIS_URL=redis://localhost:6379  (if applicable)
# ENVIRONMENT=development
# DEBUG=true

# Edit frontend/.env with your local values:
# VITE_API_URL=http://localhost:8000/api
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

### Backend

```bash
cd backend

# Development mode (hot reload)
uv run uvicorn src.main:app --reload --port 8000
# or
poetry run uvicorn src.main:app --reload --port 8000

# Backend runs at http://localhost:8000
# OpenAPI docs at http://localhost:8000/docs (Swagger UI)
# Alternative docs at http://localhost:8000/redoc (ReDoc)
# Health check at http://localhost:8000/health
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

# Backend: http://localhost:8000
# Frontend: http://localhost:5173
# PostgreSQL: localhost:5432
# Redis: localhost:6379 (if applicable)
```

## 6. Run Tests

```bash
# Backend tests
cd backend
uv run pytest                          # All tests
uv run pytest tests/unit/              # Unit tests only
uv run pytest tests/integration/       # Integration tests only
uv run pytest --cov=src --cov-report=html  # Coverage report

# Frontend tests
cd frontend
pnpm test                              # All tests
pnpm test:cov                          # Coverage report
```

## 7. Code Quality

```bash
# Backend lint + format
cd backend
uv run ruff check .                    # Lint
uv run ruff format .                   # Format
uv run mypy src/                       # Type check

# Frontend
cd frontend
pnpm lint                              # Lint
pnpm typecheck                         # Type check
pnpm format                            # Format
```

## 8. Common Tasks

### Create an Alembic Migration

```bash
cd backend

# Auto-generate migration from model changes
uv run alembic revision --autogenerate -m "description of changes"

# Create empty migration for manual SQL
uv run alembic revision -m "description of changes"

# Upgrade to latest
uv run alembic upgrade head

# Downgrade one step
uv run alembic downgrade -1

# View migration history
uv run alembic history
```

### Add a New Domain Module

```bash
cd backend/src
mkdir [domain]
touch [domain]/__init__.py
touch [domain]/router.py
touch [domain]/service.py
touch [domain]/schemas.py
touch [domain]/models.py
touch [domain]/repository.py

# Register the router in src/main.py:
# app.include_router([domain].router, prefix="/api/[domain]")
```

### Build for Production

```bash
# Backend (no build step needed, but verify)
cd backend && uv run ruff check . && uv run mypy src/

# Frontend
cd frontend && pnpm build

# Docker (full stack)
docker-compose -f docker-compose.prod.yml build
```

## 9. Project URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend (dev) | http://localhost:5173 | Vite dev server |
| Backend API | http://localhost:8000/api | FastAPI |
| Swagger UI | http://localhost:8000/docs | Interactive API docs |
| ReDoc | http://localhost:8000/redoc | Alternative API docs |
| Health Check | http://localhost:8000/health | Health endpoint |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache/Queue (if applicable) |

## 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | `lsof -i :8000` and kill the process, or change port in uvicorn command |
| Database connection refused | Ensure PostgreSQL is running: `docker-compose ps` |
| Migration fails | Check DATABASE_URL in .env, ensure DB exists: `createdb [name]` |
| Import errors | Ensure virtual env is activated: `source .venv/bin/activate` or use `uv run` |
| CORS errors | Check `CORS_ORIGINS` in backend .env matches frontend URL |
| Redis connection refused | Ensure Redis is running or remove REDIS_URL from .env |
| Alembic target not found | Run `uv run alembic heads` to check current state |
| async driver error | Ensure DATABASE_URL uses `postgresql+asyncpg://` prefix |
