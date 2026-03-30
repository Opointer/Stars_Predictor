import Link from "next/link";

import { HeroPanel } from "@/components/dashboard/hero-panel";
import { UpcomingGameCard } from "@/components/dashboard/upcoming-game-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { SetupNotice } from "@/components/ui/setup-notice";
import { formatPercent } from "@/lib/formatters";
import { getPerformanceSummary, getRecentFormSummary, getUpcomingGames } from "@/lib/queries/dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const [upcomingGames, performance, recentForm] = await Promise.all([
      getUpcomingGames(),
      getPerformanceSummary(),
      getRecentFormSummary()
    ]);

    const nextGame = upcomingGames[0] ?? null;

    return (
      <div className="grid gap-6">
        <HeroPanel game={nextGame} />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <SectionCard title="Upcoming Dallas Stars games" eyebrow="Schedule">
            <div className="grid gap-4">
              {upcomingGames.length > 0 ? (
                upcomingGames.map((game) => <UpcomingGameCard key={game.id} game={game} />)
              ) : (
                <EmptyState title="No upcoming games found" body="Run the pipeline seed job to populate the next slate of Stars matchups." />
              )}
            </div>
          </SectionCard>

          <div className="grid gap-6">
            <SectionCard title="Recent form" eyebrow="Snapshot">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Last sample</span>
                  <span className="font-semibold text-ink">{recentForm.sampleSize} games</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Record</span>
                  <span className="font-semibold text-ink">{recentForm.wins}-{recentForm.losses}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Average model probability</span>
                  <span className="font-semibold text-ink">{formatPercent(recentForm.averagePredictedWinProbability, 1)}</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Model pulse" eyebrow="Baseline">
              {performance ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">Accuracy</span>
                    <span className="font-semibold text-ink">{formatPercent(performance.accuracy, 1)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">Brier score</span>
                    <span className="font-semibold text-ink">{performance.brierScore.toFixed(3)}</span>
                  </div>
                  <Link href="/performance" className="inline-flex text-sm font-semibold text-stars-green">
                    View model performance
                  </Link>
                </div>
              ) : (
                <EmptyState title="No performance snapshot yet" body="Seeded evaluation metrics will appear here after pipeline execution." />
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return <SetupNotice message={error instanceof Error ? error.message : "Unable to connect to the database."} />;
  }
}
