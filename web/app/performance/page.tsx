import { MetricBar } from "@/components/charts/metric-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { SetupNotice } from "@/components/ui/setup-notice";
import { getPerformanceSummary } from "@/lib/queries/dashboard";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  try {
    const performance = await getPerformanceSummary();

    return (
      <div className="grid gap-5 xl:gap-6">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stars-mint">Model authority</p>
            <h1 className="mt-3 font-display text-5xl font-semibold uppercase tracking-[0.04em] text-white 2xl:text-[4.15rem]">Performance desk</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Baseline quality, calibration context, and evaluation coverage presented as a concise operating snapshot.
            </p>
          </div>
        </section>

        <SectionCard title="Latest NHL data snapshot" eyebrow="Baseline evaluation" tone="highlight">
          {performance ? (
            <div className="grid gap-5 2xl:grid-cols-[1.3fr_0.85fr]">
              <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-1">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 2xl:p-6">
                  <MetricBar label="Accuracy" value={performance.accuracy} />
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Percentage of games where the model picked the correct winner</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 2xl:p-6">
                  <MetricBar label="Brier score" value={performance.brierScore} max={0.5} inverse />
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Lower is better. This measures how closely probabilities matched actual outcomes.</p>
                </div>
              </div>
              <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-1">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-stars-mint">Model version</p>
                  <p className="mt-2 font-display text-[2.45rem] font-semibold uppercase text-white">{performance.modelVersion}</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Evaluation window</p>
                  <p className="mt-2 text-base font-semibold leading-7 text-white">{performance.evaluationWindow}</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Games evaluated</p>
                  <p className="mt-2 font-display text-[2.45rem] font-semibold uppercase text-white">{performance.gamesEvaluated}</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 xl:col-span-3 2xl:col-span-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Calibration note</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{performance.calibrationNotes ?? "No notes recorded."}</p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="No model metrics found" body="Run the pipeline after predictions are written to the database to refresh evaluation metrics." />
          )}
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <SetupNotice message={error instanceof Error ? error.message : "Unable to load performance summary."} />;
  }
}
