"""Data loading utilities for {{projectName}}."""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd


def load_csv(path: str | Path) -> pd.DataFrame:
    """Load a CSV file and return a DataFrame."""
    return pd.read_csv(path)


def make_synthetic_dataset(n_samples: int = 100, n_features: int = 4, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    """Generate a synthetic classification dataset for smoke-testing.

    No file system or network access required.
    """
    rng = np.random.default_rng(seed)
    X = rng.standard_normal((n_samples, n_features))
    y = (X[:, 0] > 0).astype(int)
    return X, y
