import Link from "next/link";

import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { ProbabilityBar } from "@/components/ui/probability-bar";
import { formatGameDate } from "@/lib/formatters";
import type { UpcomingGameView } from "@/lib/types";

export function UpcomingGameCard({ game }: { game: UpcomingGameView }) {
  return (
    <Link href={`/games/${game.id}`} className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-stars-green/40 hover:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stars-green">
            {game.isHome ? "Home" : "Away"} • {game.seasonType}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">vs {game.opponentName}</h3>
          <p className="mt-1 text-sm text-slate-600">{formatGameDate(game.startTimeUtc)}</p>
        </div>
        <ConfidenceBadge tier={game.confidenceTier} />
      </div>
      <div className="mt-5">
        <ProbabilityBar label="Dallas win probability" value={game.starsWinProbability} />
      </div>
    </Link>
  );
}
