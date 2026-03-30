import { desc, sql } from "drizzle-orm";

import { TEAM_ABBREVIATION } from "@/lib/constants/site";
import { getDb } from "@/lib/db/client";
import { gameFeatures, games, modelMetrics, predictions, teams } from "@/lib/db/schema";
import type { GameDetailView, HistoryGameView, PerformanceSummaryView, UpcomingGameView } from "@/lib/types";

function normalizeTimestamp(value: unknown): string {
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid timestamp string received from database: ${value}`);
    }
    return parsed.toISOString();
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid Date received from database.");
    }
    return value.toISOString();
  }

  throw new Error("Unsupported timestamp value received from database.");
}

function getConfidenceTier(probability: number): "low" | "medium" | "high" {
  if (probability >= 0.64) {
    return "high";
  }
  if (probability >= 0.57) {
    return "medium";
  }
  return "low";
}

function mapUpcomingRow(row: any): UpcomingGameView {
  const starsAreHome = row.homeTeamAbbreviation === TEAM_ABBREVIATION;
  const opponentName = starsAreHome ? row.awayTeamName : row.homeTeamName;
  const opponentAbbreviation = starsAreHome ? row.awayTeamAbbreviation : row.homeTeamAbbreviation;
  const starsWinProbability = Number(
    row.starsWinProbability ?? (starsAreHome ? row.homeWinProbability : row.awayWinProbability)
  );

  return {
    id: row.id,
    season: row.season,
    seasonType: row.seasonType,
    startTimeUtc: normalizeTimestamp(row.startTimeUtc),
    status: row.status,
    opponentName,
    opponentAbbreviation,
    isHome: starsAreHome,
    homeTeamName: row.homeTeamName,
    awayTeamName: row.awayTeamName,
    homeWinProbability: Number(row.homeWinProbability),
    awayWinProbability: Number(row.awayWinProbability),
    starsWinProbability,
    confidenceTier: row.confidenceTier ?? getConfidenceTier(starsWinProbability),
    confidenceScore: Number(row.confidenceScore ?? Math.abs(starsWinProbability - 0.5) * 2),
    explanationSummary: row.explanationSummary
  };
}

export async function getUpcomingGames(): Promise<UpcomingGameView[]> {
  const db = getDb();
  const rows = await db.execute(sql`
    select
      g.id,
      g.season,
      g.season_type as "seasonType",
      g.start_time_utc as "startTimeUtc",
      g.status,
      ht.name as "homeTeamName",
      at.name as "awayTeamName",
      ht.abbreviation as "homeTeamAbbreviation",
      at.abbreviation as "awayTeamAbbreviation",
      p.home_win_probability as "homeWinProbability",
      p.away_win_probability as "awayWinProbability",
      p.stars_win_probability as "starsWinProbability",
      p.confidence_tier as "confidenceTier",
      p.confidence_score as "confidenceScore",
      p.explanation_summary as "explanationSummary"
    from games g
    join predictions p on p.game_id = g.id
    join teams ht on ht.id = g.home_team_id
    join teams at on at.id = g.away_team_id
    where g.is_stars_game = true and g.status = 'scheduled'
    order by g.start_time_utc asc
  `);

  return rows.map((row) => mapUpcomingRow(row as Record<string, unknown>));
}

export async function getPredictionHistory(): Promise<HistoryGameView[]> {
  const db = getDb();

  const rows = await db.execute(sql`
    select
      g.id,
      g.season,
      g.season_type as "seasonType",
      g.start_time_utc as "startTimeUtc",
      g.status,
      ht.name as "homeTeamName",
      at.name as "awayTeamName",
      ht.abbreviation as "homeTeamAbbreviation",
      at.abbreviation as "awayTeamAbbreviation",
      p.home_win_probability as "homeWinProbability",
      p.away_win_probability as "awayWinProbability",
      p.stars_win_probability as "starsWinProbability",
      p.confidence_tier as "confidenceTier",
      p.confidence_score as "confidenceScore",
      p.explanation_summary as "explanationSummary",
      g.home_score as "homeScore",
      g.away_score as "awayScore",
      p.predicted_winner_team_id as "predictedWinnerTeamId",
      wt.abbreviation as "winnerTeamAbbreviation",
      g.winner_team_id as "winnerTeamId"
    from games g
    join predictions p on p.game_id = g.id
    join teams ht on ht.id = g.home_team_id
    join teams at on at.id = g.away_team_id
    left join teams wt on wt.id = g.winner_team_id
    where g.is_stars_game = true and g.status = 'final'
    order by g.start_time_utc desc
  `);

  return rows.map((row) => {
    const base = mapUpcomingRow(row);
    return {
      ...base,
      homeScore: row.homeScore as number | null,
      awayScore: row.awayScore as number | null,
      winnerTeamAbbreviation: row.winnerTeamAbbreviation as string | null,
      wasPredictionCorrect:
        row.winnerTeamId && row.predictedWinnerTeamId ? row.winnerTeamId === row.predictedWinnerTeamId : null
    };
  });
}

export async function getGameDetail(gameId: number): Promise<GameDetailView | null> {
  const db = getDb();

  const rows = await db.execute(sql`
    select
      g.id,
      g.season,
      g.season_type as "seasonType",
      g.start_time_utc as "startTimeUtc",
      g.status,
      g.venue_name as "venueName",
      ht.name as "homeTeamName",
      at.name as "awayTeamName",
      ht.abbreviation as "homeTeamAbbreviation",
      at.abbreviation as "awayTeamAbbreviation",
      p.home_win_probability as "homeWinProbability",
      p.away_win_probability as "awayWinProbability",
      p.stars_win_probability as "starsWinProbability",
      p.confidence_tier as "confidenceTier",
      p.confidence_score as "confidenceScore",
      p.explanation_summary as "explanationSummary",
      p.model_inputs_snapshot as "modelInputsSnapshot",
      gf.home_recent_win_pct as "homeRecentWinPct",
      gf.away_recent_win_pct as "awayRecentWinPct",
      gf.home_goal_diff_recent as "homeGoalDiffRecent",
      gf.away_goal_diff_recent as "awayGoalDiffRecent",
      gf.home_home_split_win_pct as "homeHomeSplitWinPct",
      gf.away_away_split_win_pct as "awayAwaySplitWinPct",
      gf.home_rest_days as "homeRestDays",
      gf.away_rest_days as "awayRestDays"
    from games g
    join predictions p on p.game_id = g.id
    join game_features gf on gf.game_id = g.id
    join teams ht on ht.id = g.home_team_id
    join teams at on at.id = g.away_team_id
    where g.id = ${gameId}
    limit 1
  `);

  const row = rows[0] as Record<string, any> | undefined;

  if (!row) {
    return null;
  }

  const base = mapUpcomingRow(row);
  const starsAreHome = row.homeTeamAbbreviation === TEAM_ABBREVIATION;

  return {
    ...base,
    venueName: row.venueName,
    modelInputsSnapshot: row.modelInputsSnapshot,
    featureSummary: {
      starsRecentWinPct: Number(starsAreHome ? row.homeRecentWinPct : row.awayRecentWinPct),
      opponentRecentWinPct: Number(starsAreHome ? row.awayRecentWinPct : row.homeRecentWinPct),
      starsGoalDiffRecent: Number(starsAreHome ? row.homeGoalDiffRecent : row.awayGoalDiffRecent),
      opponentGoalDiffRecent: Number(starsAreHome ? row.awayGoalDiffRecent : row.homeGoalDiffRecent),
      starsSplitWinPct: Number(starsAreHome ? row.homeHomeSplitWinPct : row.awayAwaySplitWinPct),
      opponentSplitWinPct: Number(starsAreHome ? row.awayAwaySplitWinPct : row.homeHomeSplitWinPct),
      starsRestDays: starsAreHome ? row.homeRestDays : row.awayRestDays,
      opponentRestDays: starsAreHome ? row.awayRestDays : row.homeRestDays,
      homeIceAdvantage: Number(row.modelInputsSnapshot.home_ice_advantage ?? 0)
    }
  };
}

export async function getPerformanceSummary(): Promise<PerformanceSummaryView | null> {
  const db = getDb();
  const [row] = await db
    .select({
      modelVersion: modelMetrics.modelVersion,
      evaluationWindow: modelMetrics.evaluationWindow,
      gamesEvaluated: modelMetrics.gamesEvaluated,
      accuracy: modelMetrics.accuracy,
      brierScore: modelMetrics.brierScore,
      calibrationNotes: modelMetrics.calibrationNotes,
      updatedAt: modelMetrics.createdAt
    })
    .from(modelMetrics)
    .orderBy(desc(modelMetrics.createdAt))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    modelVersion: row.modelVersion,
    evaluationWindow: row.evaluationWindow,
    gamesEvaluated: row.gamesEvaluated,
    accuracy: Number(row.accuracy),
    brierScore: Number(row.brierScore),
    calibrationNotes: row.calibrationNotes,
    updatedAt: normalizeTimestamp(row.updatedAt)
  };
}

export async function getRecentFormSummary() {
  const history = await getPredictionHistory();
  const recent = history.slice(0, 5);
  const wins = recent.filter((game) => game.winnerTeamAbbreviation === TEAM_ABBREVIATION).length;

  return {
    sampleSize: recent.length,
    wins,
    losses: Math.max(recent.length - wins, 0),
    averagePredictedWinProbability:
      recent.reduce((total, game) => total + game.starsWinProbability, 0) / Math.max(recent.length, 1)
  };
}
