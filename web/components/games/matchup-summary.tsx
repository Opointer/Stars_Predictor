import { formatPercent, formatSignedNumber } from "@/lib/formatters";
import type { GameDetailView } from "@/lib/types";

const rows = [
  { key: "starsRecentWinPct", label: "Dallas recent win rate", format: formatPercent },
  { key: "opponentRecentWinPct", label: "Opponent recent win rate", format: formatPercent },
  { key: "starsGoalDiffRecent", label: "Dallas recent goal differential", format: formatSignedNumber },
  { key: "opponentGoalDiffRecent", label: "Opponent recent goal differential", format: formatSignedNumber },
  { key: "starsSplitWinPct", label: "Dallas venue split win rate", format: formatPercent },
  { key: "opponentSplitWinPct", label: "Opponent venue split win rate", format: formatPercent },
  { key: "starsRestDays", label: "Dallas rest days", format: (value: number) => `${value}` },
  { key: "opponentRestDays", label: "Opponent rest days", format: (value: number) => `${value}` },
  { key: "homeIceAdvantage", label: "Home ice factor", format: (value: number) => formatSignedNumber(value, 2) }
] as const;

export function MatchupSummary({ game }: { game: GameDetailView }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map((row) => {
        const rawValue = game.featureSummary[row.key];
        return (
          <div key={row.key} className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{row.label}</p>
            <p className="mt-3 font-display text-3xl font-semibold uppercase text-white">{row.format(rawValue)}</p>
          </div>
        );
      })}
    </div>
  );
}
