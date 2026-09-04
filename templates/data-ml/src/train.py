"""Training entrypoint for {{projectName}}."""
from __future__ import annotations

import argparse
import logging

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from .data_loader import make_synthetic_dataset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def train(n_samples: int = 500, test_size: float = 0.2, seed: int = 42) -> dict:
    """Train a baseline model and return metrics."""
    X, y = make_synthetic_dataset(n_samples=n_samples, seed=seed)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=seed)

    model = LogisticRegression(random_state=seed)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)

    logger.info("Accuracy: %.4f", acc)
    return {"accuracy": acc, "model": model}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train {{projectName}} baseline model")
    parser.add_argument("--samples", type=int, default=500)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    metrics = train(n_samples=args.samples, seed=args.seed)
    print(f"Training complete. Accuracy: {metrics['accuracy']:.4f}")
