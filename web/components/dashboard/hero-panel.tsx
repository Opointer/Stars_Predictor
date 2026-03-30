import Link from "next/link";

import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { ProbabilityBar } from "@/components/ui/probability-bar";
import { formatGameDate } from "@/lib/formatters";
import type { UpcomingGameView } from "@/lib/types";

export function HeroPanel({ game }: { game: UpcomingGameView | null }) {
  if (!game) {
    return (
      <section className="panel-surface rounded-[2.25rem] px-8 py-10 text-white">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stars-mint">Dallas Stars outlook</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold uppercase tracking-[0.04em]">
          Predictions will appear once the latest NHL schedule is available in the pipeline.
        </h1>
      </section>
    );
  }

  return (
    <section className="panel-surface relative overflow-hidden rounded-[2.5rem] px-7 py-8 text-white xl:px-8 xl:py-8 2xl:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(111,211,165,0.16),transparent_25rem),radial-gradient(circle_at_bottom_right,rgba(18,54,84,0.5),transparent_28rem)]" />
      <div className="relative grid gap-6 2xl:grid-cols-[1.7fr_0.9fr] 2xl:items-start">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              Next game briefing
            </span>
            <span className="rounded-full border border-stars-mint/20 bg-stars-green/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-stars-mint">
              {game.isHome ? "Home ice edge" : "Road projection"}
            </span>
          </div>
          <h1 className="mt-5 font-display text-5xl font-semibold uppercase tracking-[0.04em] sm:text-6xl 2xl:text-[4.75rem]">DAL vs {game.opponentAbbreviation}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 2xl:text-lg">
            {game.isHome ? "American Airlines Center spotlight." : "Away-night pressure test."} {formatGameDate(game.startTimeUtc)}
          </p>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">
            {game.explanationSummary ?? "Baseline model blend of recent form, goal differential, split performance, rest, and home ice."}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              href={`/games/${game.id}`}
              className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-stars-night transition hover:bg-stars-mint"
            >
              Open intelligence briefing
            </Link>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Updated from the latest NHL data snapshot</p>
          </div>
        </div>
        <div className="grid gap-4 xl:max-w-[30rem] xl:justify-self-end">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 2xl:p-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-300">Stars win probability</p>
              <ConfidenceBadge tier={game.confidenceTier} />
            </div>
            <div className="mt-4">
              <ProbabilityBar label="Dallas Stars" value={game.starsWinProbability} accent="bg-stars-mint" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 2xl:p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Venue split</p>
              <p className="mt-2 font-display text-[2rem] font-semibold uppercase text-white">{game.isHome ? "Home" : "Away"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 2xl:p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Model confidence</p>
              <p className="mt-2 font-display text-[2rem] font-semibold uppercase text-white">{game.confidenceTier}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
