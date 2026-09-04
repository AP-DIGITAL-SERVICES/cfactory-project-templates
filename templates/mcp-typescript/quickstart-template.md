# Quickstart: [PROJECT_NAME] - MCP TypeScript

## Prerequisites

- Node.js 20+
- pnpm/npm
- Docker (optional sidecars)

## 1) Clone and install

```bash
git clone [REPO_URL]
cd [PROJECT_NAME]
pnpm install
```

## 2) Configure environment

```bash
cp .env.example .env
```

Typical values:
- `MCP_TRANSPORT=stdio`
- `MCP_AUTH=none`
- `REQUEST_TIMEOUT_MS=30000`
- `LOG_LEVEL=info`

## 3) Run server

```bash
pnpm dev
```

## 4) Validate quality

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## 5) Validate contract snapshots

```bash
pnpm test:contracts
```

## Troubleshooting

- Transport connection issues: verify selected mode and client expectations.
- Auth errors on HTTP/SSE: validate token config and middleware order.
- Contract drift: update generated schemas and consumers together.
- Timeout spikes: inspect downstream dependencies and per-tool budgets.
