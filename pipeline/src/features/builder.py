from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from statistics import mean

from psycopg import Connection
from psycopg.types.json import Jsonb


@dataclass(frozen=True)
class TeamFeatureSnapshot:
    recent_win_pct: float
    recent_goal_diff: float
    split_win_pct: float
    rest_days: int
    rolling_last_5_wins: int
    rolling_last_5_goals_for_avg: float
    rolling_last_5_goals_against_avg: float


def _compute_team_snapshot(connection: Connection, team_id: int, is_home: bool, game_time: datetime) -> TeamFeatureSnapshot:
    venue_column = "home_team_id" if is_home else "away_team_id"

    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT
                g.start_time_utc,
                CASE WHEN g.home_team_id = %s THEN g.home_score ELSE g.away_score END AS goals_for,
                CASE WHEN g.home_team_id = %s THEN g.away_score ELSE g.home_score END AS goals_against,
                CASE WHEN g.winner_team_id = %s THEN 1 ELSE 0 END AS won
            FROM games g
            WHERE (g.home_team_id = %s OR g.away_team_id = %s)
              AND g.status = 'final'
              AND g.start_time_utc < %s
            ORDER BY g.start_time_utc DESC
            """,
            (team_id, team_id, team_id, team_id, team_id, game_time),
        )
        prior_games = cursor.fetchall()

        cursor.execute(
            f"""
            SELECT
                CASE WHEN g.winner_team_id = %s THEN 1 ELSE 0 END AS won
            FROM games g
            WHERE g.{venue_column} = %s
              AND g.status = 'final'
              AND g.start_time_utc < %s
            ORDER BY g.start_time_utc DESC
            LIMIT 5
            """,
            (team_id, team_id, game_time),
        )
        venue_games = cursor.fetchall()

    last_five = prior_games[:5]
    if last_five:
        recent_win_pct = sum(game["won"] for game in last_five) / len(last_five)
        recent_goal_diff = mean(game["goals_for"] - game["goals_against"] for game in last_five)
        last_game_time = prior_games[0]["start_time_utc"]
        rest_days = max((game_time - last_game_time).days - 1, 0)
        rolling_last_5_wins = sum(game["won"] for game in last_five)
        rolling_last_5_goals_for_avg = mean(game["goals_for"] for game in last_five)
        rolling_last_5_goals_against_avg = mean(game["goals_against"] for game in last_five)
    else:
        recent_win_pct = 0.5
        recent_goal_diff = 0.0
        rest_days = 3
        rolling_last_5_wins = 0
        rolling_last_5_goals_for_avg = 3.0
        rolling_last_5_goals_against_avg = 3.0

    split_win_pct = sum(game["won"] for game in venue_games) / len(venue_games) if venue_games else 0.5

    return TeamFeatureSnapshot(
        recent_win_pct=recent_win_pct,
        recent_goal_diff=recent_goal_diff,
        split_win_pct=split_win_pct,
        rest_days=rest_days,
        rolling_last_5_wins=rolling_last_5_wins,
        rolling_last_5_goals_for_avg=rolling_last_5_goals_for_avg,
        rolling_last_5_goals_against_avg=rolling_last_5_goals_against_avg,
    )


def build_features(connection: Connection, feature_version: str) -> None:
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM team_game_stats")
        cursor.execute("DELETE FROM game_features")
        cursor.execute(
            """
            SELECT id, home_team_id, away_team_id, start_time_utc
            FROM games
            ORDER BY start_time_utc ASC
            """
        )
        games = cursor.fetchall()

        for game in games:
            home_snapshot = _compute_team_snapshot(connection, game["home_team_id"], True, game["start_time_utc"])
            away_snapshot = _compute_team_snapshot(connection, game["away_team_id"], False, game["start_time_utc"])

            cursor.execute(
                """
                INSERT INTO team_game_stats (
                    game_id, team_id, is_home, goals_for, goals_against, win_boolean, rest_days,
                    rolling_last_5_wins, rolling_last_5_goals_for_avg, rolling_last_5_goals_against_avg
                )
                SELECT
                    %s, %s, true, COALESCE(home_score, 0), COALESCE(away_score, 0),
                    CASE WHEN winner_team_id = %s THEN true ELSE false END,
                    %s, %s, %s, %s
                FROM games
                WHERE id = %s
                """,
                (
                    game["id"],
                    game["home_team_id"],
                    game["home_team_id"],
                    home_snapshot.rest_days,
                    home_snapshot.rolling_last_5_wins,
                    home_snapshot.rolling_last_5_goals_for_avg,
                    home_snapshot.rolling_last_5_goals_against_avg,
                    game["id"],
                ),
            )

            cursor.execute(
                """
                INSERT INTO team_game_stats (
                    game_id, team_id, is_home, goals_for, goals_against, win_boolean, rest_days,
                    rolling_last_5_wins, rolling_last_5_goals_for_avg, rolling_last_5_goals_against_avg
                )
                SELECT
                    %s, %s, false, COALESCE(away_score, 0), COALESCE(home_score, 0),
                    CASE WHEN winner_team_id = %s THEN true ELSE false END,
                    %s, %s, %s, %s
                FROM games
                WHERE id = %s
                """,
                (
                    game["id"],
                    game["away_team_id"],
                    game["away_team_id"],
                    away_snapshot.rest_days,
                    away_snapshot.rolling_last_5_wins,
                    away_snapshot.rolling_last_5_goals_for_avg,
                    away_snapshot.rolling_last_5_goals_against_avg,
                    game["id"],
                ),
            )

            cursor.execute(
                """
                INSERT INTO game_features (
                    game_id, generated_at, feature_version, home_recent_win_pct, away_recent_win_pct,
                    home_goal_diff_recent, away_goal_diff_recent, home_home_split_win_pct, away_away_split_win_pct,
                    home_rest_days, away_rest_days, stars_form_score, opponent_form_score, feature_payload
                )
                VALUES (%s, NOW(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                """,
                (
                    game["id"],
                    feature_version,
                    home_snapshot.recent_win_pct,
                    away_snapshot.recent_win_pct,
                    home_snapshot.recent_goal_diff,
                    away_snapshot.recent_goal_diff,
                    home_snapshot.split_win_pct,
                    away_snapshot.split_win_pct,
                    home_snapshot.rest_days,
                    away_snapshot.rest_days,
                    home_snapshot.recent_win_pct + home_snapshot.recent_goal_diff,
                    away_snapshot.recent_win_pct + away_snapshot.recent_goal_diff,
                    Jsonb({
                        "home_recent_win_pct": round(home_snapshot.recent_win_pct, 4),
                        "away_recent_win_pct": round(away_snapshot.recent_win_pct, 4),
                        "home_goal_diff_recent": round(home_snapshot.recent_goal_diff, 4),
                        "away_goal_diff_recent": round(away_snapshot.recent_goal_diff, 4),
                        "home_home_split_win_pct": round(home_snapshot.split_win_pct, 4),
                        "away_away_split_win_pct": round(away_snapshot.split_win_pct, 4),
                        "home_rest_days": home_snapshot.rest_days,
                        "away_rest_days": away_snapshot.rest_days,
                    }),
                ),
            )

    connection.commit()
