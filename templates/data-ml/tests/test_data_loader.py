"""Smoke tests — no GPU, network, or filesystem access required."""
import numpy as np
import pytest

from src.data_loader import make_synthetic_dataset
from src.train import train
from src.predict import predict


def test_make_synthetic_dataset_shape():
    X, y = make_synthetic_dataset(n_samples=50, n_features=4)
    assert X.shape == (50, 4)
    assert y.shape == (50,)


def test_make_synthetic_dataset_deterministic():
    X1, y1 = make_synthetic_dataset(seed=0)
    X2, y2 = make_synthetic_dataset(seed=0)
    np.testing.assert_array_equal(X1, X2)
    np.testing.assert_array_equal(y1, y2)


def test_train_returns_metrics():
    metrics = train(n_samples=100, seed=42)
    assert "accuracy" in metrics
    assert 0.0 <= metrics["accuracy"] <= 1.0


def test_predict_shape():
    metrics = train(n_samples=100, seed=42)
    X, _ = make_synthetic_dataset(n_samples=10, seed=1)
    preds = predict(metrics["model"], X)
    assert preds.shape == (10,)
