from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[3]


@dataclass(frozen=True)
class Settings:
    database_url: str
    seed_path: Path = ROOT_DIR / "data" / "seed" / "seed_data.json"
    model_version: str = "baseline-v1"
    feature_version: str = "form-goals-rest-v1"
    home_ice_advantage: float = 0.22


def get_settings() -> Settings:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError("DATABASE_URL is required for the pipeline.")
    return Settings(database_url=database_url)
