import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { SetupNotice } from "@/components/ui/setup-notice";
import { formatGameDate, formatPercent } from "@/lib/formatters";
import { getPredictionHistory } from "@/lib/queries/dashboard";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  try {
    const history = await getPredictionHistory();

    return (
      <SectionCard title="Prediction history" eyebrow="Results">
        {history.length === 0 ? (
          <EmptyState title="No completed Stars games found" body="Seed historical games and rerun the evaluation job to populate history." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-4">Game</th>
                  <th className="px-4">Date</th>
                  <th className="px-4">Prediction</th>
                  <th className="px-4">Confidence</th>
                  <th className="px-4">Result</th>
                  <th className="px-4">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {history.map((game) => (
                  <tr key={game.id} className="rounded-2xl bg-white shadow-sm">
                    <td className="rounded-l-2xl px-4 py-4 font-semibold text-ink">DAL vs {game.opponentAbbreviation}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{formatGameDate(game.startTimeUtc)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{formatPercent(game.starsWinProbability, 1)}</td>
                    <td className="px-4 py-4">
                      <ConfidenceBadge tier={game.confidenceTier} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {game.homeScore}-{game.awayScore}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 text-sm font-semibold">
                      {game.wasPredictionCorrect ? <span className="text-victory">Correct</span> : <span className="text-danger">Missed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    );
  } catch (error) {
    return <SetupNotice message={error instanceof Error ? error.message : "Unable to load prediction history."} />;
  }
}
