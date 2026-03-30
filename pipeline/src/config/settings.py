from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str
    team_abbreviation: str = "DAL"
    recent_lookback_days: int = 45
    model_version: str = "baseline-v1"
    feature_version: str = "form-goals-rest-v1"
    home_ice_advantage: float = 0.22


def get_settings() -> Settings:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError("DATABASE_URL is required for the pipeline.")

    team_abbreviation = os.getenv("TEAM_ABBREVIATION", "DAL").strip().upper() or "DAL"
    recent_lookback_days = int(os.getenv("RECENT_LOOKBACK_DAYS", "45"))
    return Settings(
        database_url=database_url,
        team_abbreviation=team_abbreviation,
        recent_lookback_days=recent_lookback_days,
    )
