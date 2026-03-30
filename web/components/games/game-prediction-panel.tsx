import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { ProbabilityBar } from "@/components/ui/probability-bar";
import { formatGameDate } from "@/lib/formatters";
import type { GameDetailView } from "@/lib/types";

export function GamePredictionPanel({ game }: { game: GameDetailView }) {
  return (
    <div className="rounded-[2rem] bg-stars-night p-8 text-white shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-stars-mint">{game.seasonType}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {game.awayTeamName} at {game.homeTeamName}
          </h1>
          <p className="mt-3 text-slate-300">
            {formatGameDate(game.startTimeUtc)} {game.venueName ? `• ${game.venueName}` : ""}
          </p>
        </div>
        <ConfidenceBadge tier={game.confidenceTier} />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <ProbabilityBar label={game.homeTeamName} value={game.homeWinProbability} accent="bg-stars-mint" />
        <ProbabilityBar label={game.awayTeamName} value={game.awayWinProbability} accent="bg-slate-300" />
      </div>
      <p className="mt-6 max-w-3xl text-sm text-slate-300">
        {game.explanationSummary ?? "Probability derived from recent form, goal differential, split performance, rest differential, and home ice advantage."}
      </p>
    </div>
  );
}
