from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class SeedData:
    teams: list[dict[str, Any]]
    games: list[dict[str, Any]]


def load_seed_data(seed_path: Path) -> SeedData:
    payload = json.loads(seed_path.read_text(encoding="utf-8"))
    return SeedData(teams=payload["teams"], games=payload["games"])


def parse_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)
