"""Smoke tests — no database or orchestrator required."""
import pandas as pd
import pytest

from src.pipeline import PipelineConfig, PipelineResult, extract, transform, load, run_pipeline


@pytest.fixture
def sample_df() -> pd.DataFrame:
    return pd.DataFrame({"id": [1, 2, 3], "value": ["a", "b", "c"]})


@pytest.fixture
def config() -> PipelineConfig:
    return PipelineConfig(name="test-pipeline", run_date="2024-01-01")


def test_extract_from_dataframe(sample_df, config):
    result = extract(sample_df, config)
    assert len(result) == 3
    assert list(result.columns) == ["id", "value"]


def test_transform_adds_metadata(sample_df, config):
    transformed = transform(sample_df, config)
    assert "_pipeline" in transformed.columns
    assert "_run_date" in transformed.columns
    assert transformed["_pipeline"].iloc[0] == "test-pipeline"


def test_load_dry_run(sample_df, config):
    result = load(sample_df, "dry-run", config)
    assert result.success is True
    assert result.rows_processed == 3


def test_run_pipeline_end_to_end(sample_df, config):
    result = run_pipeline(source=sample_df, destination="dry-run", config=config)
    assert result.success is True
    assert result.rows_processed == 3
    assert result.errors == []


def test_pipeline_result_dataclass():
    r = PipelineResult(success=True, rows_processed=0)
    assert r.errors == []
    assert r.metadata == {}
