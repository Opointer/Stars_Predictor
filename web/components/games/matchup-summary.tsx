import { formatPercent, formatSignedNumber } from "@/lib/formatters";
import type { GameDetailView } from "@/lib/types";

const rows = [
  { key: "starsRecentWinPct", label: "Stars recent win rate", format: formatPercent },
  { key: "opponentRecentWinPct", label: "Opponent recent win rate", format: formatPercent },
  { key: "starsGoalDiffRecent", label: "Stars recent goal differential", format: formatSignedNumber },
  { key: "opponentGoalDiffRecent", label: "Opponent recent goal differential", format: formatSignedNumber },
  { key: "starsSplitWinPct", label: "Stars venue split win rate", format: formatPercent },
  { key: "opponentSplitWinPct", label: "Opponent venue split win rate", format: formatPercent },
  { key: "starsRestDays", label: "Stars rest days", format: (value: number) => `${value}` },
  { key: "opponentRestDays", label: "Opponent rest days", format: (value: number) => `${value}` },
  { key: "homeIceAdvantage", label: "Home ice factor", format: (value: number) => formatSignedNumber(value, 2) }
] as const;

export function MatchupSummary({ game }: { game: GameDetailView }) {
  return (
    <div className="grid gap-3">
      {rows.map((row) => {
        const rawValue = game.featureSummary[row.key];
        return (
          <div key={row.key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">{row.label}</span>
            <span className="font-semibold text-ink">{row.format(rawValue)}</span>
          </div>
        );
      })}
    </div>
  );
}
