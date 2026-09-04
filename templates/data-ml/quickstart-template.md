# Quickstart: [PROJECT_NAME] - Data ML

## Prerequisites

- Python 3.11+
- `uv` or `pip` + virtualenv
- Docker + Docker Compose (optional local services)
- Optional: GPU drivers/runtime for deep learning workloads

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
- `DATA_ROOT=./data`
- `EXPERIMENT_TRACKING_URI=...`
- `MODEL_REGISTRY_URI=...`
- `RANDOM_SEED=42`

## 3) Validate data and run baseline

```bash
python -m src.data.validate
python -m src.training.run --config configs/baseline.yaml
```

## 4) Evaluate and register candidate

```bash
python -m src.evaluation.compare --run-id [RUN_ID]
python -m src.registry.promote --run-id [RUN_ID] --stage staging
```

## 5) Run serving locally (if online inference)

```bash
python -m src.serving.app
```

Optional checks:
- Prediction endpoint contract
- Latency smoke test
- Drift monitor dry-run

## 6) Quality checks

```bash
ruff check .
ruff format --check .
pytest -q
```

## Troubleshooting

- Non-reproducible metrics: verify seed, split, and feature pipeline versions.
- Training/serving mismatch: confirm shared preprocessing artifacts.
- Registry promotion blocked: verify threshold gates and model signature.
- Drift false positives: review baseline window and monitoring thresholds.
