# CFactory project templates

Source of truth for CFactory **project** (stack) starters. Connect this repository as an organization **Git template source** in CFactory Admin, then **Index** — the gateway stores **metadata only** and fetches file trees from Git when creating a project.

## Layout

```
templates/<stack>/.cfactory/template.json
templates/<stack>/…   # project root files (bootstrap + devops + SDD overlays)
```

## Stacks

- `platform.web-nestjs` — Web app (React + NestJS)
- `platform.web-fastapi` — Web app (React + FastAPI)
- `platform.web-dotnet` — Web app (React + ASP.NET)
- `platform.web-static` — Static web (React + Vite)
- `platform.mobile-nestjs` — Mobile (React Native + NestJS)
- `platform.mobile-fastapi` — Mobile (React Native + FastAPI)
- `platform.api-nestjs` — API (NestJS)
- `platform.api-fastapi` — API (FastAPI)
- `platform.api-dotnet` — API (ASP.NET)
- `platform.data-ml` — Data / ML
- `platform.data-engineering` — Data engineering
- `platform.mcp-python` — MCP server (Python)
- `platform.mcp-typescript` — MCP server (TypeScript)

## Origin

Content was imported once from SpecForge stack kits during the CFactory migration. SpecForge is not an upstream; edit templates here going forward.

## Connecting

1. Admin → Project templates → Template git sources → Add this repo URL.
2. Click **Index** (discovers every `**/.cfactory/template.json`).
3. `cfactory project list` / create-project skill / `cfactory project new platform.web-nestjs --dir ./app --set project_name=app`.
