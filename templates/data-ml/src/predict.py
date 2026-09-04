"""Inference utilities for {{projectName}}."""
from __future__ import annotations

import numpy as np


def predict(model, X: np.ndarray) -> np.ndarray:
    """Run inference on input array X."""
    return model.predict(X)


def predict_proba(model, X: np.ndarray) -> np.ndarray:
    """Return class probabilities for input X."""
    return model.predict_proba(X)
