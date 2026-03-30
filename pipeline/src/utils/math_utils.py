from __future__ import annotations

import math


def logistic(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-value))


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))
