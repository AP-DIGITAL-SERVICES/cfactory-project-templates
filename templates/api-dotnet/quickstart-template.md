# Quickstart: [PROJECT_NAME] - ASP.NET Core API

## Prerequisites

- .NET SDK 8+
- Docker + Docker Compose
- PostgreSQL or SQL Server instance
- Optional: Redis/queue broker

## 1) Clone and restore

```bash
git clone [REPO_URL]
cd [PROJECT_NAME]
cd api
dotnet restore
```

## 2) Configure environment

```bash
cp .env.example .env
```

Minimum variables:
- `ASPNETCORE_ENVIRONMENT=Development`
- `ConnectionStrings__Main=...`
- `Auth__Strategy=Jwt`
- `Auth__Jwt__Issuer=...`
- `Auth__Jwt__Audience=...`
- `Auth__Jwt__SigningKey=...`
- `Redis__ConnectionString=...` (if used)

## 3) Start dependencies

```bash
docker compose up -d postgres redis
```

## 4) Apply migrations and run

```bash
dotnet ef database update
dotnet run --project src/Api
```

Service URLs:
- API: `http://localhost:5000/api/v1`
- OpenAPI: `http://localhost:5000/swagger`
- Live health: `http://localhost:5000/health/live`
- Ready health: `http://localhost:5000/health/ready`

## 5) Quality gates

```bash
dotnet format --verify-no-changes
dotnet build -warnaserror
dotnet test
```

## 6) Common tasks

```bash
# create EF migration
dotnet ef migrations add [MigrationName] --project src/Infrastructure --startup-project src/Api

# generate OpenAPI (if configured)
dotnet build /t:GenerateOpenApiDocuments
```

## Troubleshooting

- Migration conflicts: verify startup project and design-time DbContext.
- 401/403 confusion: confirm policy names, scopes, and claim mapping.
- Slow endpoints: inspect generated SQL and index usage.
- Health ready failing: validate DB/cache/queue connectivity and secrets.
