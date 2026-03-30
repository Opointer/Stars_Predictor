export type ConfidenceTier = "low" | "medium" | "high";

export interface UpcomingGameView {
  id: number;
  season: number;
  seasonType: string;
  startTimeUtc: string;
  status: string;
  opponentName: string;
  opponentAbbreviation: string;
  isHome: boolean;
  homeTeamName: string;
  awayTeamName: string;
  homeWinProbability: number;
  awayWinProbability: number;
  starsWinProbability: number;
  confidenceTier: ConfidenceTier;
  confidenceScore: number;
  explanationSummary: string | null;
}

export interface HistoryGameView extends UpcomingGameView {
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamAbbreviation: string | null;
  wasPredictionCorrect: boolean | null;
}

export interface GameDetailView extends UpcomingGameView {
  venueName: string | null;
  modelInputsSnapshot: Record<string, number | string>;
  featureSummary: {
    starsRecentWinPct: number;
    opponentRecentWinPct: number;
    starsGoalDiffRecent: number;
    opponentGoalDiffRecent: number;
    starsSplitWinPct: number;
    opponentSplitWinPct: number;
    starsRestDays: number;
    opponentRestDays: number;
    homeIceAdvantage: number;
  };
}

export interface PerformanceSummaryView {
  modelVersion: string;
  evaluationWindow: string;
  gamesEvaluated: number;
  accuracy: number;
  brierScore: number;
  calibrationNotes: string | null;
  updatedAt: string;
}
