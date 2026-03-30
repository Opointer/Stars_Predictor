from __future__ import annotations

from dataclasses import dataclass

from psycopg import Connection
from psycopg.types.json import Jsonb

from src.utils.math_utils import clamp, logistic


@dataclass(frozen=True)
class PredictionResult:
    game_id: int
    predicted_winner_team_id: int
    home_win_probability: float
    away_win_probability: float
    stars_win_probability: float | None
    confidence_score: float
    confidence_tier: str
    explanation_summary: str
    model_inputs_snapshot: dict[str, float]


def _confidence_tier(probability: float) -> str:
    if probability >= 0.64:
        return "high"
    if probability >= 0.57:
        return "medium"
    return "low"


def _build_explanation(inputs: dict[str, float]) -> str:
    edges: list[str] = []
    if inputs["recent_win_pct_edge"] > 0.06:
        edges.append("Dallas holds the stronger recent win profile" if inputs["stars_are_home"] or inputs["stars_win_probability"] > 0.5 else "the home side holds the stronger recent win profile")
    if inputs["goal_diff_edge"] > 0.25:
        edges.append("goal differential has tilted the projection")
    if inputs["rest_edge"] > 0:
        edges.append("rest advantage helps the expected pace")
    if inputs["home_ice_advantage"] > 0:
        edges.append("home ice adds a small baseline bump")
    return ", ".join(edges) if edges else "Recent form and venue factors are mostly balanced."


def score_predictions(connection: Connection, model_version: str, feature_version: str, home_ice_advantage: float) -> None:
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM predictions")
        cursor.execute(
            """
            SELECT
                g.id,
                g.home_team_id,
                g.away_team_id,
                g.status,
                g.is_stars_game,
                ht.abbreviation AS home_abbreviation,
                at.abbreviation AS away_abbreviation,
                gf.home_recent_win_pct,
                gf.away_recent_win_pct,
                gf.home_goal_diff_recent,
                gf.away_goal_diff_recent,
                gf.home_home_split_win_pct,
                gf.away_away_split_win_pct,
                gf.home_rest_days,
                gf.away_rest_days
            FROM games g
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            JOIN game_features gf ON gf.game_id = g.id
            ORDER BY g.start_time_utc ASC
            """
        )
        rows = cursor.fetchall()

        for row in rows:
            recent_win_pct_edge = row["home_recent_win_pct"] - row["away_recent_win_pct"]
            goal_diff_edge = row["home_goal_diff_recent"] - row["away_goal_diff_recent"]
            split_edge = row["home_home_split_win_pct"] - row["away_away_split_win_pct"]
            rest_edge = row["home_rest_days"] - row["away_rest_days"]

            linear_score = (
                1.10 * recent_win_pct_edge
                + 0.35 * goal_diff_edge
                + 0.60 * split_edge
                + 0.08 * rest_edge
                + home_ice_advantage
            )

            home_probability = clamp(logistic(linear_score), 0.08, 0.92)
            away_probability = 1 - home_probability
            predicted_winner_team_id = row["home_team_id"] if home_probability >= away_probability else row["away_team_id"]
            confidence_score = abs(home_probability - 0.5) * 2
            stars_win_probability = None
            if row["is_stars_game"]:
                stars_win_probability = home_probability if row["home_abbreviation"] == "DAL" else away_probability

            model_inputs_snapshot = {
                "recent_win_pct_edge": round(recent_win_pct_edge, 4),
                "goal_diff_edge": round(goal_diff_edge, 4),
                "split_edge": round(split_edge, 4),
                "rest_edge": round(rest_edge, 4),
                "home_ice_advantage": round(home_ice_advantage, 4),
                "stars_are_home": 1.0 if row["home_abbreviation"] == "DAL" else 0.0,
                "stars_win_probability": round(stars_win_probability if stars_win_probability is not None else home_probability, 4),
            }

            cursor.execute(
                """
                INSERT INTO predictions (
                    game_id, model_version, feature_version, generated_at, predicted_winner_team_id,
                    home_win_probability, away_win_probability, stars_win_probability,
                    confidence_score, confidence_tier, explanation_summary, model_inputs_snapshot
                )
                VALUES (%s, %s, %s, NOW(), %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                """,
                (
                    row["id"],
                    model_version,
                    feature_version,
                    predicted_winner_team_id,
                    home_probability,
                    away_probability,
                    stars_win_probability,
                    confidence_score,
                    _confidence_tier(stars_win_probability if stars_win_probability is not None else home_probability),
                    _build_explanation(model_inputs_snapshot),
                    Jsonb(model_inputs_snapshot),
                ),
            )

    connection.commit()
