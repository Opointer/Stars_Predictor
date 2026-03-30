from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


NHL_API_BASE_URL = "https://api-web.nhle.com/v1"
DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36",
    "Accept": "application/json",
}


@dataclass(frozen=True)
class NhlIngestionDataset:
    teams: list[dict[str, Any]]
    games: list[dict[str, Any]]
    recent_game_count: int
    upcoming_game_count: int
    current_season_label: str


def _fetch_json(path: str) -> dict[str, Any]:
    request = Request(f"{NHL_API_BASE_URL}/{path.lstrip('/')}", headers=DEFAULT_HEADERS)
    try:
        with urlopen(request, timeout=30) as response:
            return json.load(response)
    except HTTPError as exc:
        raise RuntimeError(f"NHL API request failed for {path} with HTTP {exc.code}.") from exc
    except URLError as exc:
        raise RuntimeError(f"NHL API request failed for {path}: {exc.reason}.") from exc


def _parse_utc_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


def _season_from_nhl_season(value: int) -> int:
    return int(str(value)[:4])


def _season_type_from_game_type(game_type: int) -> str | None:
    if game_type == 1:
        return "preseason"
    if game_type == 2:
        return "regular"
    if game_type == 3:
        return "playoffs"
    return None


def _status_from_game_state(game_state: str, schedule_state: str | None) -> str:
    normalized_state = (game_state or "").upper()
    normalized_schedule_state = (schedule_state or "").upper()

    if normalized_state in {"FINAL", "OFF"}:
        return "final"
    if "POSTPON" in normalized_state or "POSTPON" in normalized_schedule_state:
        return "postponed"
    return "scheduled"


def _team_name_parts(team_payload: dict[str, Any]) -> tuple[str, str]:
    city = (
        team_payload.get("placeName", {}).get("default")
        or team_payload.get("name", {}).get("default")
        or team_payload.get("name", {}).get("default")
        or ""
    )
    nickname = team_payload.get("commonName", {}).get("default") or ""
    if city and nickname:
        return city, f"{city} {nickname}"

    full_name = team_payload.get("name", {}).get("default") or ""
    if full_name:
        parts = full_name.split(" ", 1)
        if len(parts) == 2:
            return parts[0], full_name
        return full_name, full_name

    abbreviation = team_payload.get("abbrev") or team_payload.get("teamAbbrev", {}).get("default") or "UNK"
    return abbreviation, abbreviation


def _build_team_records(standings_payload: dict[str, Any]) -> list[dict[str, Any]]:
    teams: list[dict[str, Any]] = []
    for team in standings_payload.get("standings", []):
        abbreviation = team["teamAbbrev"]["default"]
        city, full_name = _team_name_parts(
            {
                "placeName": {"default": team["placeName"]["default"]},
                "commonName": {"default": team["teamName"]["default"].replace(f"{team['placeName']['default']} ", "", 1)},
                "abbrev": abbreviation,
            }
        )
        teams.append(
            {
                "nhl_team_code": abbreviation,
                "name": full_name,
                "city": city,
                "abbreviation": abbreviation,
                "conference": team["conferenceName"],
                "division": team["divisionName"],
                "is_active": True,
            }
        )
    return teams


def _normalize_team_reference(team_payload: dict[str, Any]) -> dict[str, Any]:
    abbreviation = team_payload["abbrev"]
    team_id = team_payload.get("id")
    city, full_name = _team_name_parts(team_payload)
    return {
        "api_team_id": team_id,
        "abbreviation": abbreviation,
        "city": city,
        "name": full_name,
    }


def _normalize_game(game_payload: dict[str, Any], team_abbreviation: str) -> dict[str, Any]:
    start_time = _parse_utc_timestamp(game_payload["startTimeUTC"])
    season_type = _season_type_from_game_type(int(game_payload["gameType"]))
    if season_type is None:
        raise ValueError(f"Unsupported NHL gameType received: {game_payload['gameType']}")
    home_team = _normalize_team_reference(game_payload["homeTeam"])
    away_team = _normalize_team_reference(game_payload["awayTeam"])
    home_score = game_payload["homeTeam"].get("score")
    away_score = game_payload["awayTeam"].get("score")
    status = _status_from_game_state(game_payload.get("gameState", ""), game_payload.get("gameScheduleState"))
    winner_team = None

    if status == "final" and home_score is not None and away_score is not None and home_score != away_score:
        winner_team = home_team["abbreviation"] if home_score > away_score else away_team["abbreviation"]

    return {
        "external_game_id": str(game_payload["id"]),
        "season": _season_from_nhl_season(game_payload["season"]),
        "season_type": season_type,
        "game_date": start_time,
        "start_time_utc": start_time,
        "home_team": home_team["abbreviation"],
        "away_team": away_team["abbreviation"],
        "venue_name": game_payload.get("venue", {}).get("default"),
        "status": status,
        "home_score": int(home_score) if home_score is not None else None,
        "away_score": int(away_score) if away_score is not None else None,
        "winner_team": winner_team,
        "is_stars_game": home_team["abbreviation"] == team_abbreviation or away_team["abbreviation"] == team_abbreviation,
    }


def _fetch_recent_completed_games(team_abbreviation: str, lookback_days: int) -> list[dict[str, Any]]:
    today = datetime.now(tz=timezone.utc).date()
    recent_games: dict[str, dict[str, Any]] = {}

    for offset in range(lookback_days + 1):
        game_date = today - timedelta(days=offset)
        payload = _fetch_json(f"score/{game_date.isoformat()}")
        for game in payload.get("games", []):
            if _status_from_game_state(game.get("gameState", ""), game.get("gameScheduleState")) != "final":
                continue
            try:
                normalized = _normalize_game(game, team_abbreviation=team_abbreviation)
            except ValueError:
                continue
            recent_games[normalized["external_game_id"]] = normalized

    return sorted(recent_games.values(), key=lambda game: game["start_time_utc"])


def _fetch_current_season_schedule(team_abbreviation: str) -> dict[str, Any]:
    return _fetch_json(f"club-schedule-season/{team_abbreviation}/now")


def _filter_upcoming_team_games(schedule_payload: dict[str, Any], team_abbreviation: str) -> list[dict[str, Any]]:
    upcoming: dict[str, dict[str, Any]] = {}
    now = datetime.now(tz=timezone.utc)

    for game in schedule_payload.get("games", []):
        try:
            normalized = _normalize_game(game, team_abbreviation=team_abbreviation)
        except ValueError:
            continue
        if normalized["status"] != "scheduled":
            continue
        if normalized["start_time_utc"] <= now:
            continue
        upcoming[normalized["external_game_id"]] = normalized

    return sorted(upcoming.values(), key=lambda game: game["start_time_utc"])


def load_nhl_dataset(team_abbreviation: str, recent_lookback_days: int) -> NhlIngestionDataset:
    standings_payload = _fetch_json("standings/now")
    teams = _build_team_records(standings_payload)
    recent_games = _fetch_recent_completed_games(team_abbreviation, recent_lookback_days)
    season_schedule = _fetch_current_season_schedule(team_abbreviation)
    upcoming_games = _filter_upcoming_team_games(season_schedule, team_abbreviation)

    games_by_external_id: dict[str, dict[str, Any]] = {}
    for game in recent_games + upcoming_games:
        games_by_external_id[game["external_game_id"]] = game

    return NhlIngestionDataset(
        teams=teams,
        games=sorted(games_by_external_id.values(), key=lambda game: game["start_time_utc"]),
        recent_game_count=len(recent_games),
        upcoming_game_count=len(upcoming_games),
        current_season_label=str(season_schedule.get("seasonStartDate", date.today().isoformat()))[:4],
    )
