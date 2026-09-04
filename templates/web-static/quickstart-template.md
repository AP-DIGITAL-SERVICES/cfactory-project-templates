# Quickstart: [PROJECT_NAME] — Static Site (React + Vite + shadcn/ui)

## Prerequisites

- Node.js 20+ (`node -v`)
- npm 10+ (`npm -v`) — or pnpm/yarn if you prefer
- Docker + Docker Compose (optional, for the nginx container) (`docker --version`)
- Git (`git --version`)

## 1. Clone & Install

```bash
git clone [REPO_URL]
cd [PROJECT_NAME]/frontend
npm install
```

## 2. Environment Setup

```bash
cp .env.example .env
# Edit .env — only VITE_-prefixed values are exposed to the client:
# VITE_APP_NAME=[PROJECT_NAME]
```

## 3. Run the Dev Server

```bash
npm run dev
# Site runs at http://localhost:5173 (Vite default) with hot reload
```

## 4. Run Tests

```bash
npm run test        # all tests (Vitest)
npm run test:watch  # watch mode
npm run test:cov    # coverage report
```

## 5. Code Quality

```bash
npm run lint        # ESLint
npm run build       # type-check (tsc -b) + production build
```

## 6. Build for Production

```bash
npm run build       # outputs static assets to dist/
npm run preview     # preview the production build locally
```

## 7. Common Tasks

### Add a shadcn/ui component

```bash
# Using the shadcn CLI (reads components.json)
npx shadcn@latest add dialog
# Components are written to src/components/ui/
```

### Add a new section

```bash
mkdir -p src/sections/pricing
# Create src/sections/pricing/Pricing.tsx, compose shadcn primitives,
# keep copy in src/content/pricing.ts, then render it from App.tsx.
```

### Run via Docker (nginx)

```bash
# After `specforge generate dockerfile` produces frontend/Dockerfile:
docker compose up --build
# Static site served at http://localhost:3001
```

## 8. Deploy

Deploy the `dist/` folder to any static host:

```bash
# Example: sync to S3 (with a CDN in front)
aws s3 sync dist s3://[YOUR_BUCKET] --delete

# Or deploy the nginx container image built from frontend/Dockerfile.
```

Remember to configure an SPA fallback (`/index.html`) and long-cache the hashed
`assets/` while keeping `index.html` uncached.

## 9. Project URLs

| Service | URL | Notes |
|---------|-----|-------|
| Dev server | http://localhost:5173 | Vite dev server |
| Preview | http://localhost:4173 | `npm run preview` |
| Docker (nginx) | http://localhost:3001 | Production build |

## 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change the port: `npm run dev -- --port 5174` |
| Blank page after deploy | Ensure SPA fallback to `/index.html` and correct base path |
| Assets 404 under a sub-path | Build with the right base: `npm run build -- --base=/subpath/` |
| Dark mode not persisting | Check `storageKey` in `<ThemeProvider>` and browser storage |
| Type errors on build | Run `npm run build` locally; fix before pushing (CI enforces it) |
