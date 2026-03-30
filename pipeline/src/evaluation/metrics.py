from __future__ import annotations

import math
from datetime import datetime, timezone

from psycopg import Connection


def write_metrics(connection: Connection, model_run_id: int, model_version: str) -> None:
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM model_metrics")
        cursor.execute(
            """
            SELECT
                g.home_team_id,
                p.home_win_probability,
                p.predicted_winner_team_id,
                g.winner_team_id
            FROM predictions p
            JOIN games g ON g.id = p.game_id
            WHERE g.status = 'final'
            """
        )
        rows = cursor.fetchall()

        if not rows:
            return

        correct = 0
        squared_errors = []
        log_losses = []

        for row in rows:
            if row["winner_team_id"] == row["predicted_winner_team_id"]:
                correct += 1

            predicted_home_prob = row["home_win_probability"]
            actual_outcome = 1.0 if row["winner_team_id"] == row["home_team_id"] else 0.0
            squared_errors.append((predicted_home_prob - actual_outcome) ** 2)
            bounded_prob = min(max(predicted_home_prob, 1e-6), 1 - 1e-6)
            log_losses.append(-(actual_outcome * math.log(bounded_prob) + (1 - actual_outcome) * math.log(1 - bounded_prob)))

        games_evaluated = len(rows)
        accuracy = correct / games_evaluated
        brier_score = sum(squared_errors) / games_evaluated
        log_loss = sum(log_losses) / games_evaluated

        cursor.execute(
            """
            INSERT INTO model_metrics (
                model_run_id, model_version, evaluation_window, games_evaluated,
                accuracy, brier_score, log_loss, calibration_notes, created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                model_run_id,
                model_version,
                "Rolling recent NHL completed games",
                games_evaluated,
                accuracy,
                brier_score,
                log_loss,
                "Baseline probabilities are generated from recent-form features and a fixed home-ice prior.",
                datetime.now(tz=timezone.utc),
            ),
        )

    connection.commit()
