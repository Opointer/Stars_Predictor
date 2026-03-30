import Link from "next/link";

import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { ProbabilityBar } from "@/components/ui/probability-bar";
import { formatGameDate } from "@/lib/formatters";
import type { UpcomingGameView } from "@/lib/types";

export function UpcomingGameCard({ game }: { game: UpcomingGameView }) {
  return (
    <Link
      href={`/games/${game.id}`}
      className="group block rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-stars-mint/35 hover:bg-white/[0.06] 2xl:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stars-mint">
            {game.isHome ? "Home" : "Away"} • {game.seasonType}
          </p>
          <h3 className="font-display text-[2rem] font-semibold uppercase tracking-[0.05em] text-white 2xl:text-[2.15rem]">vs {game.opponentName}</h3>
          <p className="text-sm text-slate-400">{formatGameDate(game.startTimeUtc)}</p>
        </div>
        <ConfidenceBadge tier={game.confidenceTier} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
        <ProbabilityBar label="Dallas win probability" value={game.starsWinProbability} />
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-stars-mint">
          <span>Matchup detail</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
