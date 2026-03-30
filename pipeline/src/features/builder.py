from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass, field
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


@dataclass(frozen=True)
class PriorGameResult:
    start_time_utc: datetime
    goals_for: int
    goals_against: int
    won: int


@dataclass
class TeamHistoryState:
    recent_games: deque[PriorGameResult] = field(default_factory=lambda: deque(maxlen=5))
    home_results: deque[int] = field(default_factory=lambda: deque(maxlen=5))
    away_results: deque[int] = field(default_factory=lambda: deque(maxlen=5))
    last_game_time: datetime | None = None


def _compute_team_snapshot(team_histories: dict[int, TeamHistoryState], team_id: int, is_home: bool, game_time: datetime) -> TeamFeatureSnapshot:
    history = team_histories[team_id]
    last_five = list(history.recent_games)

    if last_five:
        recent_win_pct = sum(game.won for game in last_five) / len(last_five)
        recent_goal_diff = mean(game.goals_for - game.goals_against for game in last_five)
        rolling_last_5_wins = sum(game.won for game in last_five)
        rolling_last_5_goals_for_avg = mean(game.goals_for for game in last_five)
        rolling_last_5_goals_against_avg = mean(game.goals_against for game in last_five)
        rest_days = max((game_time - history.last_game_time).days - 1, 0) if history.last_game_time else 3
    else:
        recent_win_pct = 0.5
        recent_goal_diff = 0.0
        rest_days = 3
        rolling_last_5_wins = 0
        rolling_last_5_goals_for_avg = 3.0
        rolling_last_5_goals_against_avg = 3.0

    venue_games = history.home_results if is_home else history.away_results
    split_win_pct = sum(venue_games) / len(venue_games) if venue_games else 0.5

    return TeamFeatureSnapshot(
        recent_win_pct=recent_win_pct,
        recent_goal_diff=recent_goal_diff,
        split_win_pct=split_win_pct,
        rest_days=rest_days,
        rolling_last_5_wins=rolling_last_5_wins,
        rolling_last_5_goals_for_avg=rolling_last_5_goals_for_avg,
        rolling_last_5_goals_against_avg=rolling_last_5_goals_against_avg,
    )


def _coalesce_score(score: int | None) -> int:
    return score if score is not None else 0


def _record_completed_game(
    team_histories: dict[int, TeamHistoryState],
    *,
    team_id: int,
    is_home: bool,
    game_time: datetime,
    goals_for: int,
    goals_against: int,
    won: int,
) -> None:
    history = team_histories[team_id]
    history.recent_games.append(
        PriorGameResult(
            start_time_utc=game_time,
            goals_for=goals_for,
            goals_against=goals_against,
            won=won,
        )
    )
    if is_home:
        history.home_results.append(won)
    else:
        history.away_results.append(won)
    history.last_game_time = game_time


def build_features(connection: Connection, feature_version: str) -> None:
    team_histories: dict[int, TeamHistoryState] = defaultdict(TeamHistoryState)
    team_game_stats_rows: list[tuple[object, ...]] = []
    game_features_rows: list[tuple[object, ...]] = []

    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM team_game_stats")
        cursor.execute("DELETE FROM game_features")
        cursor.execute(
            """
            SELECT
                id,
                home_team_id,
                away_team_id,
                start_time_utc,
                status,
                home_score,
                away_score,
                winner_team_id
            FROM games
            ORDER BY start_time_utc ASC, id ASC
            """
        )
        games = cursor.fetchall()

        for game in games:
            game_id = game["id"]
            game_time = game["start_time_utc"]
            home_team_id = game["home_team_id"]
            away_team_id = game["away_team_id"]
            home_score = _coalesce_score(game["home_score"])
            away_score = _coalesce_score(game["away_score"])
            winner_team_id = game["winner_team_id"]

            home_snapshot = _compute_team_snapshot(team_histories, home_team_id, True, game_time)
            away_snapshot = _compute_team_snapshot(team_histories, away_team_id, False, game_time)

            team_game_stats_rows.append(
                (
                    game_id,
                    home_team_id,
                    True,
                    home_score,
                    away_score,
                    winner_team_id == home_team_id,
                    home_snapshot.rest_days,
                    home_snapshot.rolling_last_5_wins,
                    home_snapshot.rolling_last_5_goals_for_avg,
                    home_snapshot.rolling_last_5_goals_against_avg,
                )
            )
            team_game_stats_rows.append(
                (
                    game_id,
                    away_team_id,
                    False,
                    away_score,
                    home_score,
                    winner_team_id == away_team_id,
                    away_snapshot.rest_days,
                    away_snapshot.rolling_last_5_wins,
                    away_snapshot.rolling_last_5_goals_for_avg,
                    away_snapshot.rolling_last_5_goals_against_avg,
                )
            )
            game_features_rows.append(
                (
                    game_id,
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
                    Jsonb(
                        {
                            "home_recent_win_pct": round(home_snapshot.recent_win_pct, 4),
                            "away_recent_win_pct": round(away_snapshot.recent_win_pct, 4),
                            "home_goal_diff_recent": round(home_snapshot.recent_goal_diff, 4),
                            "away_goal_diff_recent": round(away_snapshot.recent_goal_diff, 4),
                            "home_home_split_win_pct": round(home_snapshot.split_win_pct, 4),
                            "away_away_split_win_pct": round(away_snapshot.split_win_pct, 4),
                            "home_rest_days": home_snapshot.rest_days,
                            "away_rest_days": away_snapshot.rest_days,
                        }
                    ),
                )
            )

            if game["status"] == "final":
                _record_completed_game(
                    team_histories,
                    team_id=home_team_id,
                    is_home=True,
                    game_time=game_time,
                    goals_for=home_score,
                    goals_against=away_score,
                    won=1 if winner_team_id == home_team_id else 0,
                )
                _record_completed_game(
                    team_histories,
                    team_id=away_team_id,
                    is_home=False,
                    game_time=game_time,
                    goals_for=away_score,
                    goals_against=home_score,
                    won=1 if winner_team_id == away_team_id else 0,
                )

        cursor.executemany(
            """
            INSERT INTO team_game_stats (
                game_id, team_id, is_home, goals_for, goals_against, win_boolean, rest_days,
                rolling_last_5_wins, rolling_last_5_goals_for_avg, rolling_last_5_goals_against_avg
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            team_game_stats_rows,
        )

        cursor.executemany(
            """
            INSERT INTO game_features (
                game_id, generated_at, feature_version, home_recent_win_pct, away_recent_win_pct,
                home_goal_diff_recent, away_goal_diff_recent, home_home_split_win_pct, away_away_split_win_pct,
                home_rest_days, away_rest_days, stars_form_score, opponent_form_score, feature_payload
            )
            VALUES (%s, NOW(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
            """,
            game_features_rows,
        )

    connection.commit()
