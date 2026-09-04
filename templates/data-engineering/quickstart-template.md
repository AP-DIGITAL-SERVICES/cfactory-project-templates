# Quickstart: [PROJECT_NAME] - Data Engineering

## Prerequisites

- Python 3.11+ and virtualenv
- Docker + Docker Compose
- Selected orchestrator dependencies
- Access to source systems and target warehouse

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
- `WAREHOUSE_URL=...`
- `ORCHESTRATOR=airflow`
- `RAW_BUCKET=...`
- `QUALITY_RESULTS_TABLE=...`

## 3) Start local dependencies

```bash
docker compose up -d postgres redis
```

## 4) Validate source contracts and run sample pipeline

```bash
python -m src.ingestion.validate_sources
python -m src.pipelines.run --pipeline [pipeline_name] --date [YYYY-MM-DD]
```

## 5) Run quality checks

```bash
python -m src.quality.run --dataset [dataset_name]
```

## 6) Common tasks

```bash
# backfill one dataset window
python -m src.backfill.run --dataset [name] --start [YYYY-MM-DD] --end [YYYY-MM-DD]

# publish lineage metadata
python -m src.lineage.publish
```

## Troubleshooting

- Late/partial source data: run contract checks and pause downstream publish.
- Duplicate rows after retry: verify idempotent load keys and merge conditions.
- SLA misses: inspect orchestration critical path and warehouse contention.
- Schema drift: bump schema version and notify downstream owners.
