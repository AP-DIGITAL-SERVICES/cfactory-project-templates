# Quickstart: [PROJECT_NAME] - NestJS API

## Prerequisites

- Node.js 20+
- pnpm or yarn
- Docker + Docker Compose
- PostgreSQL (or selected relational database)
- Optional: Redis (cache/queues)

## 1) Clone and install

```bash
git clone [REPO_URL]
cd [PROJECT_NAME]
cd api
pnpm install
```

## 2) Configure environment

```bash
cp .env.example .env
```

Minimum variables:
- `PORT=3000`
- `DATABASE_URL=...`
- `AUTH_STRATEGY=jwt`
- `JWT_SECRET=...` (if JWT)
- `REDIS_URL=...` (if caching/queues)
- `OTEL_EXPORTER_OTLP_ENDPOINT=...` (if tracing)

## 3) Start dependencies

```bash
docker compose up -d postgres redis
```

## 4) Run migrations and start app

```bash
pnpm migration:run
pnpm start:dev
```

Service URLs:
- API: `http://localhost:3000/api/v1`
- OpenAPI docs: `http://localhost:3000/api/docs`
- Live health: `http://localhost:3000/health/live`
- Ready health: `http://localhost:3000/health/ready`

## 5) Validate quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

## 6) Common tasks

```bash
# Generate migration
pnpm migration:generate src/migrations/[MigrationName]

# Revert migration
pnpm migration:revert

# Build production bundle
pnpm build
```

## Troubleshooting

- DB connection fails: verify `DATABASE_URL` and `docker compose ps`.
- 401 responses: verify token issuer/audience and clock skew.
- Slow list endpoints: confirm indexes and pagination strategy.
- Contract drift: regenerate/validate OpenAPI before merge.
