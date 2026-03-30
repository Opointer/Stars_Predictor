import Link from "next/link";

import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { ProbabilityBar } from "@/components/ui/probability-bar";
import { formatGameDate } from "@/lib/formatters";
import type { UpcomingGameView } from "@/lib/types";

export function HeroPanel({ game }: { game: UpcomingGameView | null }) {
  if (!game) {
    return (
      <div className="rounded-[2rem] bg-stars-night p-8 text-white shadow-panel">
        <p className="text-sm uppercase tracking-[0.2em] text-stars-mint">Dallas Stars outlook</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Predictions will appear once upcoming games are seeded.</h1>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-stars-night p-8 text-white shadow-panel">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-stars-mint">Next puck drop</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Dallas vs {game.opponentAbbreviation}</h1>
          <p className="mt-3 text-lg text-slate-300">
            {game.isHome ? "Home ice in Dallas." : "Road test away from home."} {formatGameDate(game.startTimeUtc)}
          </p>
          <p className="mt-4 max-w-xl text-sm text-slate-300">
            {game.explanationSummary ?? "Baseline model blend of recent form, goal differential, split performance, rest, and home ice."}
          </p>
          <div className="mt-5">
            <Link
              href={`/games/${game.id}`}
              className="inline-flex rounded-full bg-stars-mint px-5 py-3 text-sm font-semibold text-stars-night transition hover:opacity-90"
            >
              Open matchup detail
            </Link>
          </div>
        </div>
        <div className="w-full max-w-md rounded-[1.5rem] bg-white/8 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-200">Stars win probability</p>
            <ConfidenceBadge tier={game.confidenceTier} />
          </div>
          <div className="mt-4">
            <ProbabilityBar label="Dallas Stars" value={game.starsWinProbability} accent="bg-stars-mint" />
          </div>
        </div>
      </div>
    </div>
  );
}
