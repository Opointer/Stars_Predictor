from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from psycopg import Connection

from src.db.schema_sql import DDL, RESET_SQL


def initialize_schema(connection: Connection) -> None:
    with connection.cursor() as cursor:
        cursor.execute(DDL)
    connection.commit()


def reset_database(connection: Connection) -> None:
    with connection.cursor() as cursor:
        cursor.execute(RESET_SQL)
    connection.commit()


def load_base_tables(connection: Connection, teams_payload: list[dict[str, Any]], games_payload: list[dict[str, Any]]) -> None:
    team_id_by_code: dict[str, int] = {}

    with connection.cursor() as cursor:
        for team in teams_payload:
            cursor.execute(
                """
                INSERT INTO teams (nhl_team_code, name, city, abbreviation, conference, division, is_active)
                VALUES (%(nhl_team_code)s, %(name)s, %(city)s, %(abbreviation)s, %(conference)s, %(division)s, %(is_active)s)
                RETURNING id
                """,
                team,
            )
            team_id_by_code[team["abbreviation"]] = cursor.fetchone()["id"]

        for game in games_payload:
            start_time = game["start_time_utc"]
            home_team_id = team_id_by_code[game["home_team"]]
            away_team_id = team_id_by_code[game["away_team"]]
            home_score = game.get("home_score")
            away_score = game.get("away_score")
            winner_team_id = None
            winner_team = game.get("winner_team")
            if winner_team:
                winner_team_id = team_id_by_code[winner_team]

            cursor.execute(
                """
                INSERT INTO games (
                    external_game_id,
                    season,
                    season_type,
                    game_date,
                    start_time_utc,
                    home_team_id,
                    away_team_id,
                    venue_name,
                    status,
                    home_score,
                    away_score,
                    winner_team_id,
                    is_stars_game
                )
                VALUES (
                    %(external_game_id)s,
                    %(season)s,
                    %(season_type)s,
                    %(game_date)s,
                    %(start_time_utc)s,
                    %(home_team_id)s,
                    %(away_team_id)s,
                    %(venue_name)s,
                    %(status)s,
                    %(home_score)s,
                    %(away_score)s,
                    %(winner_team_id)s,
                    %(is_stars_game)s
                )
                """,
                {
                    "external_game_id": game["external_game_id"],
                    "season": game["season"],
                    "season_type": game["season_type"],
                    "game_date": game.get("game_date", start_time),
                    "start_time_utc": start_time,
                    "home_team_id": home_team_id,
                    "away_team_id": away_team_id,
                    "venue_name": game.get("venue_name"),
                    "status": game["status"],
                    "home_score": home_score,
                    "away_score": away_score,
                    "winner_team_id": winner_team_id,
                    "is_stars_game": game["is_stars_game"],
                },
            )

    connection.commit()


def create_model_run(connection: Connection, model_version: str, run_type: str = "manual") -> int:
    now = datetime.now(tz=timezone.utc)
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO model_runs (model_version, run_type, started_at, status, notes)
            VALUES (%s, %s, %s, 'running', %s)
            RETURNING id
            """,
            (model_version, run_type, now, "NHL public API pipeline execution"),
        )
        model_run_id = cursor.fetchone()["id"]
    connection.commit()
    return model_run_id


def complete_model_run(connection: Connection, model_run_id: int) -> None:
    now = datetime.now(tz=timezone.utc)
    with connection.cursor() as cursor:
        cursor.execute(
            """
            UPDATE model_runs
            SET completed_at = %s, status = 'completed'
            WHERE id = %s
            """,
            (now, model_run_id),
        )
    connection.commit()
