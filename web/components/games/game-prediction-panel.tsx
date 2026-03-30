import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { ProbabilityBar } from "@/components/ui/probability-bar";
import { formatGameDate } from "@/lib/formatters";
import type { GameDetailView } from "@/lib/types";

export function GamePredictionPanel({ game }: { game: GameDetailView }) {
  return (
    <section className="panel-surface relative overflow-hidden rounded-[2.5rem] px-7 py-7 text-white xl:px-8 xl:py-8 2xl:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,211,165,0.12),transparent_20rem),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_58%)]" />
      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stars-mint">{game.seasonType} intelligence briefing</p>
          <h1 className="mt-3 font-display text-5xl font-semibold uppercase tracking-[0.04em] xl:text-6xl 2xl:text-[4.7rem]">
            {game.awayTeamName} at {game.homeTeamName}
          </h1>
          <p className="mt-4 text-base text-slate-300 xl:text-lg">
            {formatGameDate(game.startTimeUtc)} {game.venueName ? `• ${game.venueName}` : ""}
          </p>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">
            {game.explanationSummary ?? "Probability derived from recent form, goal differential, split performance, rest differential, and home ice advantage."}
          </p>
        </div>
        <ConfidenceBadge tier={game.confidenceTier} />
      </div>
      <div className="relative mt-7 grid gap-4 2xl:grid-cols-[1fr_1fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 2xl:p-6">
          <ProbabilityBar label={game.homeTeamName} value={game.homeWinProbability} accent="bg-stars-mint" />
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 2xl:p-6">
          <ProbabilityBar label={game.awayTeamName} value={game.awayWinProbability} accent="bg-slate-200" />
        </div>
        <div className="grid gap-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 2xl:p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Primary lean</p>
            <p className="mt-2 font-display text-[2rem] font-semibold uppercase text-white">
              {game.homeWinProbability >= game.awayWinProbability ? game.homeTeamName : game.awayTeamName}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 2xl:p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Confidence tier</p>
            <p className="mt-2 font-display text-[2rem] font-semibold uppercase text-white">{game.confidenceTier}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
