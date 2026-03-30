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
      <div className="grid gap-5 xl:gap-6">
        <section className="grid gap-5 xl:grid-cols-[1.4fr_0.95fr] xl:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stars-mint">Forecast desk</p>
            <h1 className="mt-3 max-w-5xl font-display text-5xl font-semibold uppercase tracking-[0.04em] text-white sm:text-6xl 2xl:text-[4.35rem]">
              Premium Dallas Stars matchup intelligence, built for fast decision reads.
            </h1>
          </div>
          <div className="grid gap-3 md:grid-cols-3 xl:auto-rows-fr">
            <div className="panel-surface rounded-[1.5rem] px-5 py-4 xl:px-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Recent sample</p>
              <p className="mt-2 font-display text-[2.6rem] font-semibold uppercase text-white">{recentForm.sampleSize}</p>
            </div>
            <div className="panel-surface rounded-[1.5rem] px-5 py-4 xl:px-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Record</p>
              <p className="mt-2 font-display text-[2.6rem] font-semibold uppercase text-white">
                {recentForm.wins}-{recentForm.losses}
              </p>
            </div>
            <div className="panel-surface rounded-[1.5rem] px-5 py-4 xl:px-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Avg model lean</p>
              <p className="mt-2 font-display text-[2.6rem] font-semibold uppercase text-white">
                {formatPercent(recentForm.averagePredictedWinProbability, 1)}
              </p>
            </div>
          </div>
        </section>

        <HeroPanel game={nextGame} />

        <div className="grid gap-5 2xl:grid-cols-[1.65fr_0.9fr]">
          <SectionCard title="Upcoming Dallas Stars games" eyebrow="Schedule" tone="highlight">
            <div className="grid gap-4 2xl:grid-cols-2">
              {upcomingGames.length > 0 ? (
                upcomingGames.map((game) => <UpcomingGameCard key={game.id} game={game} />)
              ) : (
                <EmptyState title="No upcoming games found" body="Run the pipeline to refresh the latest Stars schedule and projections." />
              )}
            </div>
          </SectionCard>

          <div className="grid gap-5">
            <SectionCard title="Recent form" eyebrow="Snapshot" tone="muted">
              <div className="grid gap-3 xl:grid-cols-3 2xl:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-4 py-4 xl:px-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Last sample</p>
                  <p className="mt-2 font-display text-[2.45rem] font-semibold uppercase text-white">{recentForm.sampleSize} games</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-4 py-4 xl:px-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Record</p>
                  <p className="mt-2 font-display text-[2.45rem] font-semibold uppercase text-white">
                    {recentForm.wins}-{recentForm.losses}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-4 py-4 xl:px-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Average model probability</p>
                  <p className="mt-2 font-display text-[2.45rem] font-semibold uppercase text-white">
                    {formatPercent(recentForm.averagePredictedWinProbability, 1)}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Model pulse" eyebrow="Baseline" tone="muted">
              {performance ? (
                <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-1">
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-4 py-4 xl:px-5">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Accuracy</p>
                    <p className="mt-2 font-display text-[2.45rem] font-semibold uppercase text-white">
                      {formatPercent(performance.accuracy, 1)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-4 py-4 xl:px-5">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Brier score</p>
                    <p className="mt-2 font-display text-[2.45rem] font-semibold uppercase text-white">{performance.brierScore.toFixed(3)}</p>
                  </div>
                  <Link href="/performance" className="inline-flex items-center text-sm font-semibold uppercase tracking-[0.18em] text-stars-mint xl:col-span-2 2xl:col-span-1">
                    View model performance →
                  </Link>
                </div>
              ) : (
                <EmptyState title="No performance snapshot yet" body="Evaluation metrics will appear here after the latest NHL data run completes." />
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
