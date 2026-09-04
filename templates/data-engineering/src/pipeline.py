"""Core pipeline definition for {{projectName}}.

Each pipeline step is a pure function: input → output. No side effects in step logic.
Orchestration layer wires the steps together.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class PipelineConfig:
    """Base configuration shared across all pipeline runs."""
    name: str = "{{projectName}}"
    version: str = "0.0.1"
    run_date: str = field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))


@dataclass
class PipelineResult:
    """Captures the outcome of a single pipeline run."""
    success: bool
    rows_processed: int
    errors: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


def extract(source: str | pd.DataFrame, config: PipelineConfig) -> pd.DataFrame:
    """Extract step — returns a raw DataFrame.

    In production, `source` is a connection string or object.
    In tests, pass a DataFrame directly.
    """
    if isinstance(source, pd.DataFrame):
        logger.info("[%s] extract: received in-memory DataFrame (%d rows)", config.name, len(source))
        return source

    raise NotImplementedError(f"Source type '{type(source).__name__}' not yet supported.")


def transform(df: pd.DataFrame, config: PipelineConfig) -> pd.DataFrame:
    """Transform step — apply business rules to the raw DataFrame."""
    logger.info("[%s] transform: processing %d rows", config.name, len(df))
    df = df.copy()
    df["_pipeline"] = config.name
    df["_run_date"] = config.run_date
    return df


def load(df: pd.DataFrame, destination: str, config: PipelineConfig) -> PipelineResult:
    """Load step — write the transformed DataFrame to the destination.

    In production, `destination` is a table name or connection string.
    In tests, pass 'dry-run' to skip writing.
    """
    if destination == "dry-run":
        logger.info("[%s] load: dry-run, skipping write", config.name)
        return PipelineResult(success=True, rows_processed=len(df))

    raise NotImplementedError(f"Destination '{destination}' not yet supported.")


def run_pipeline(source: Any, destination: str, config: PipelineConfig | None = None) -> PipelineResult:
    """Run the full ETL pipeline: extract → transform → load."""
    cfg = config or PipelineConfig()
    try:
        raw = extract(source, cfg)
        transformed = transform(raw, cfg)
        result = load(transformed, destination, cfg)
        logger.info("[%s] pipeline complete: %d rows", cfg.name, result.rows_processed)
        return result
    except Exception as exc:
        logger.error("[%s] pipeline failed: %s", cfg.name, exc)
        return PipelineResult(success=False, rows_processed=0, errors=[str(exc)])
