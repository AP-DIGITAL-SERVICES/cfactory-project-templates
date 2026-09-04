# Quickstart: [PROJECT_NAME] - React + ASP.NET Core

## Prerequisites

- Node.js 20+ and pnpm/npm
- .NET SDK 8+
- Docker + Docker Compose
- PostgreSQL/SQL Server

## 1) Clone and install

```bash
git clone [REPO_URL]
cd [PROJECT_NAME]

cd frontend && pnpm install
cd ../backend && dotnet restore
```

## 2) Configure environment

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Typical values:
- `frontend/.env`: `VITE_API_URL=http://localhost:5000/api/v1`
- `backend/.env`: DB connection string, auth settings, optional Redis endpoint

## 3) Start dependencies

```bash
docker compose up -d postgres redis
```

## 4) Run backend and frontend

```bash
# terminal 1
cd backend
dotnet ef database update
dotnet run --project src/Api

# terminal 2
cd frontend
pnpm dev
```

Service URLs:
- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api/v1`
- OpenAPI: `http://localhost:5000/swagger`

## 5) Quality checks

```bash
cd frontend && pnpm lint && pnpm test
cd ../backend && dotnet format --verify-no-changes && dotnet test
```

## 6) Common tasks

```bash
# backend migration
cd backend
dotnet ef migrations add [MigrationName] --project src/Infrastructure --startup-project src/Api

# frontend e2e (example)
cd ../frontend
pnpm test:e2e
```

## Troubleshooting

- CORS issues: confirm backend allowed origins include frontend host.
- Auth loop: verify token refresh/session cookie configuration.
- Contract mismatch: regenerate API client types from OpenAPI.
- Slow page loads: inspect bundle size and API waterfall.
