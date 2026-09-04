# Quickstart: [PROJECT_NAME] - FastAPI Backend

## Prerequisites

- Python 3.11+
- `uv` or `pip` + virtualenv
- Docker + Docker Compose
- PostgreSQL (or selected DB)
- Optional: Redis/Celery stack

## 1) Clone and install

```bash
git clone [REPO_URL]
cd [PROJECT_NAME]
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) Configure environment

```bash
cp .env.example .env
```

Minimum variables:
- `APP_ENV=development`
- `APP_PORT=8000`
- `DATABASE_URL=...`
- `AUTH_STRATEGY=jwt`
- `JWT_SECRET=...` (if JWT)
- `REDIS_URL=...` (if cache/queue)

## 3) Start dependencies

```bash
docker compose up -d postgres redis
```

## 4) Migrate and run

```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Service URLs:
- API: `http://localhost:8000/api/v1`
- OpenAPI docs: `http://localhost:8000/docs`
- Ready health: `http://localhost:8000/health/ready`

## 5) Quality checks

```bash
ruff check .
ruff format --check .
mypy app
pytest -q
```

## 6) Common tasks

```bash
# create migration
alembic revision --autogenerate -m "[description]"

# apply migration
alembic upgrade head

# run integration tests only
pytest tests/integration -q
```

## Troubleshooting

- DB startup race: wait for DB readiness before migrations.
- 422 validation surprises: confirm strict Pydantic schema and aliases.
- Async timeout errors: check dependency SLAs and outbound timeout budgets.
- OpenAPI drift: ensure router tags/models match generated schema.
