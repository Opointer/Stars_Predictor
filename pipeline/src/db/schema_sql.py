DDL = """
DO $$ BEGIN
    CREATE TYPE game_status AS ENUM ('scheduled', 'final', 'postponed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE run_status AS ENUM ('pending', 'running', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE run_type AS ENUM ('backfill', 'daily', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE confidence_tier AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE season_type AS ENUM ('preseason', 'regular', 'playoffs');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    nhl_team_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    abbreviation TEXT NOT NULL UNIQUE,
    conference TEXT NOT NULL,
    division TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    external_game_id TEXT,
    season INTEGER NOT NULL,
    season_type season_type NOT NULL,
    game_date TIMESTAMPTZ NOT NULL,
    start_time_utc TIMESTAMPTZ NOT NULL,
    home_team_id INTEGER NOT NULL REFERENCES teams(id),
    away_team_id INTEGER NOT NULL REFERENCES teams(id),
    venue_name TEXT,
    status game_status NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    winner_team_id INTEGER REFERENCES teams(id),
    is_stars_game BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS team_game_stats (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id),
    team_id INTEGER NOT NULL REFERENCES teams(id),
    is_home BOOLEAN NOT NULL,
    goals_for INTEGER NOT NULL,
    goals_against INTEGER NOT NULL,
    win_boolean BOOLEAN NOT NULL,
    rest_days INTEGER NOT NULL,
    rolling_last_5_wins INTEGER NOT NULL,
    rolling_last_5_goals_for_avg DOUBLE PRECISION NOT NULL,
    rolling_last_5_goals_against_avg DOUBLE PRECISION NOT NULL,
    UNIQUE (game_id, team_id)
);

CREATE TABLE IF NOT EXISTS game_features (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id),
    generated_at TIMESTAMPTZ NOT NULL,
    feature_version TEXT NOT NULL,
    home_recent_win_pct DOUBLE PRECISION NOT NULL,
    away_recent_win_pct DOUBLE PRECISION NOT NULL,
    home_goal_diff_recent DOUBLE PRECISION NOT NULL,
    away_goal_diff_recent DOUBLE PRECISION NOT NULL,
    home_home_split_win_pct DOUBLE PRECISION NOT NULL,
    away_away_split_win_pct DOUBLE PRECISION NOT NULL,
    home_rest_days INTEGER NOT NULL,
    away_rest_days INTEGER NOT NULL,
    stars_form_score DOUBLE PRECISION,
    opponent_form_score DOUBLE PRECISION,
    feature_payload JSONB NOT NULL,
    UNIQUE (game_id, feature_version)
);

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id),
    model_version TEXT NOT NULL,
    feature_version TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL,
    predicted_winner_team_id INTEGER NOT NULL REFERENCES teams(id),
    home_win_probability DOUBLE PRECISION NOT NULL,
    away_win_probability DOUBLE PRECISION NOT NULL,
    stars_win_probability DOUBLE PRECISION,
    confidence_score DOUBLE PRECISION NOT NULL,
    confidence_tier confidence_tier NOT NULL,
    explanation_summary TEXT,
    model_inputs_snapshot JSONB NOT NULL,
    UNIQUE (game_id, model_version)
);

CREATE TABLE IF NOT EXISTS model_runs (
    id SERIAL PRIMARY KEY,
    model_version TEXT NOT NULL,
    run_type run_type NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status run_status NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS model_metrics (
    id SERIAL PRIMARY KEY,
    model_run_id INTEGER NOT NULL REFERENCES model_runs(id),
    model_version TEXT NOT NULL,
    evaluation_window TEXT NOT NULL,
    games_evaluated INTEGER NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    brier_score DOUBLE PRECISION NOT NULL,
    log_loss DOUBLE PRECISION,
    calibration_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL
);
"""

RESET_SQL = """
TRUNCATE TABLE model_metrics, model_runs, predictions, game_features, team_game_stats, games, teams RESTART IDENTITY CASCADE;
"""
