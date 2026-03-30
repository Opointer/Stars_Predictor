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
      <div className="grid gap-5 xl:gap-6">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stars-mint">Results archive</p>
            <h1 className="mt-3 font-display text-5xl font-semibold uppercase tracking-[0.04em] text-white 2xl:text-[4.15rem]">Prediction history</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Review completed Dallas Stars calls with confidence context, realized scorelines, and a quick outcome read.
            </p>
          </div>
          <div className="panel-surface rounded-[1.5rem] px-5 py-4 xl:min-w-[14rem]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Logged games</p>
            <p className="mt-2 font-display text-[2.6rem] font-semibold uppercase text-white">{history.length}</p>
          </div>
        </section>

        <SectionCard title="Analytical ledger" eyebrow="Results" tone="highlight">
          {history.length === 0 ? (
            <EmptyState title="No completed Stars games found" body="Run the pipeline to ingest recent NHL results and repopulate the ledger." />
          ) : (
            <div className="grid gap-4">
              {history.map((game) => (
                <article
                  key={game.id}
                  className="grid gap-5 rounded-[1.75rem] border border-white/10 bg-white/[0.035] px-5 py-5 transition hover:border-stars-mint/30 hover:bg-white/[0.05] xl:grid-cols-[1.35fr_0.9fr_0.75fr_0.7fr_0.65fr] 2xl:px-6"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-stars-mint">Matchup</p>
                    <h2 className="mt-2 font-display text-[2.1rem] font-semibold uppercase tracking-[0.05em] text-white">
                      DAL vs {game.opponentAbbreviation}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">{formatGameDate(game.startTimeUtc)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Win probability</p>
                    <p className="mt-2 font-display text-[2.35rem] font-semibold uppercase text-white">
                      {formatPercent(game.starsWinProbability, 1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Confidence</p>
                    <div className="mt-3">
                      <ConfidenceBadge tier={game.confidenceTier} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Final score</p>
                    <p className="mt-2 font-display text-[2.35rem] font-semibold uppercase text-white">
                      {game.homeScore}-{game.awayScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Outcome</p>
                    <p
                      className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                        game.wasPredictionCorrect
                          ? "border-victory/30 bg-victory/10 text-victory"
                          : "border-danger/30 bg-danger/10 text-danger"
                      }`}
                    >
                      {game.wasPredictionCorrect ? "Correct" : "Missed"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <SetupNotice message={error instanceof Error ? error.message : "Unable to load prediction history."} />;
  }
}
