# Quickstart: [PROJECT_NAME] - MCP Python

## Prerequisites

- Python 3.11+
- `uv` or `pip` + virtualenv
- Docker (optional for sidecars)

## 1) Clone and install

```bash
git clone [REPO_URL]
cd [PROJECT_NAME]
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) Configure environment

```bash
cp .env.example .env
```

Typical values:
- `MCP_TRANSPORT=stdio`
- `MCP_AUTH=none`
- `REQUEST_TIMEOUT_SECONDS=30`
- `LOG_LEVEL=info`

## 3) Run server

```bash
python -m src.server
```

## 4) Run tests

```bash
pytest -q
ruff check .
```

## 5) Validate tool contracts

```bash
python -m src.tools.validate_contracts
```

## Troubleshooting

- Tool timeout failures: review per-tool timeout budgets and downstream latency.
- Auth failures on HTTP/SSE: verify token issuer/audience and clock drift.
- Contract mismatch: regenerate schema snapshots and update tests.
- Unsafe input rejection: review policy limits and validation rules.
