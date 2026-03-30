import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique
} from "drizzle-orm/pg-core";

export const gameStatusEnum = pgEnum("game_status", ["scheduled", "final", "postponed"]);
export const runStatusEnum = pgEnum("run_status", ["pending", "running", "completed", "failed"]);
export const runTypeEnum = pgEnum("run_type", ["backfill", "daily", "manual"]);
export const confidenceTierEnum = pgEnum("confidence_tier", ["low", "medium", "high"]);
export const seasonTypeEnum = pgEnum("season_type", ["preseason", "regular", "playoffs"]);

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  nhlTeamCode: text("nhl_team_code").notNull().unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  abbreviation: text("abbreviation").notNull().unique(),
  conference: text("conference").notNull(),
  division: text("division").notNull(),
  isActive: boolean("is_active").notNull().default(true)
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  externalGameId: text("external_game_id"),
  season: integer("season").notNull(),
  seasonType: seasonTypeEnum("season_type").notNull(),
  gameDate: timestamp("game_date", { withTimezone: true }).notNull(),
  startTimeUtc: timestamp("start_time_utc", { withTimezone: true }).notNull(),
  homeTeamId: integer("home_team_id").notNull().references(() => teams.id),
  awayTeamId: integer("away_team_id").notNull().references(() => teams.id),
  venueName: text("venue_name"),
  status: gameStatusEnum("status").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  winnerTeamId: integer("winner_team_id").references(() => teams.id),
  isStarsGame: boolean("is_stars_game").notNull().default(false)
});

export const teamGameStats = pgTable(
  "team_game_stats",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").notNull().references(() => games.id),
    teamId: integer("team_id").notNull().references(() => teams.id),
    isHome: boolean("is_home").notNull(),
    goalsFor: integer("goals_for").notNull(),
    goalsAgainst: integer("goals_against").notNull(),
    winBoolean: boolean("win_boolean").notNull(),
    restDays: integer("rest_days").notNull(),
    rollingLast5Wins: integer("rolling_last_5_wins").notNull(),
    rollingLast5GoalsForAvg: doublePrecision("rolling_last_5_goals_for_avg").notNull(),
    rollingLast5GoalsAgainstAvg: doublePrecision("rolling_last_5_goals_against_avg").notNull()
  },
  (table) => ({
    gameTeamUnique: unique().on(table.gameId, table.teamId)
  })
);

export const gameFeatures = pgTable(
  "game_features",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").notNull().references(() => games.id),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
    featureVersion: text("feature_version").notNull(),
    homeRecentWinPct: doublePrecision("home_recent_win_pct").notNull(),
    awayRecentWinPct: doublePrecision("away_recent_win_pct").notNull(),
    homeGoalDiffRecent: doublePrecision("home_goal_diff_recent").notNull(),
    awayGoalDiffRecent: doublePrecision("away_goal_diff_recent").notNull(),
    homeHomeSplitWinPct: doublePrecision("home_home_split_win_pct").notNull(),
    awayAwaySplitWinPct: doublePrecision("away_away_split_win_pct").notNull(),
    homeRestDays: integer("home_rest_days").notNull(),
    awayRestDays: integer("away_rest_days").notNull(),
    starsFormScore: doublePrecision("stars_form_score"),
    opponentFormScore: doublePrecision("opponent_form_score"),
    featurePayload: jsonb("feature_payload").$type<Record<string, number | string>>().notNull()
  },
  (table) => ({
    gameFeatureUnique: unique().on(table.gameId, table.featureVersion)
  })
);

export const predictions = pgTable(
  "predictions",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").notNull().references(() => games.id),
    modelVersion: text("model_version").notNull(),
    featureVersion: text("feature_version").notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
    predictedWinnerTeamId: integer("predicted_winner_team_id").notNull().references(() => teams.id),
    homeWinProbability: doublePrecision("home_win_probability").notNull(),
    awayWinProbability: doublePrecision("away_win_probability").notNull(),
    starsWinProbability: doublePrecision("stars_win_probability"),
    confidenceScore: doublePrecision("confidence_score").notNull(),
    confidenceTier: confidenceTierEnum("confidence_tier").notNull(),
    explanationSummary: text("explanation_summary"),
    modelInputsSnapshot: jsonb("model_inputs_snapshot").$type<Record<string, number | string>>().notNull()
  },
  (table) => ({
    gameModelUnique: unique().on(table.gameId, table.modelVersion)
  })
);

export const modelRuns = pgTable("model_runs", {
  id: serial("id").primaryKey(),
  modelVersion: text("model_version").notNull(),
  runType: runTypeEnum("run_type").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  status: runStatusEnum("status").notNull(),
  notes: text("notes")
});

export const modelMetrics = pgTable("model_metrics", {
  id: serial("id").primaryKey(),
  modelRunId: integer("model_run_id").notNull().references(() => modelRuns.id),
  modelVersion: text("model_version").notNull(),
  evaluationWindow: text("evaluation_window").notNull(),
  gamesEvaluated: integer("games_evaluated").notNull(),
  accuracy: doublePrecision("accuracy").notNull(),
  brierScore: doublePrecision("brier_score").notNull(),
  logLoss: doublePrecision("log_loss"),
  calibrationNotes: text("calibration_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull()
});
