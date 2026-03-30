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
      <SectionCard title="Model performance" eyebrow="Baseline evaluation">
        {performance ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <MetricBar label="Accuracy" value={performance.accuracy} />
              <MetricBar label="Brier score" value={performance.brierScore} max={0.5} inverse />
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stars-green">Current snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{performance.modelVersion}</h2>
              <dl className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-600">Evaluation window</dt>
                  <dd className="font-semibold text-ink">{performance.evaluationWindow}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-600">Games evaluated</dt>
                  <dd className="font-semibold text-ink">{performance.gamesEvaluated}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-sm text-slate-600">Notes</dt>
                  <dd className="max-w-xs text-right text-sm text-slate-700">{performance.calibrationNotes ?? "No notes recorded."}</dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <EmptyState title="No model metrics found" body="Run the evaluation job after predictions are written to the database." />
        )}
      </SectionCard>
    );
  } catch (error) {
    return <SetupNotice message={error instanceof Error ? error.message : "Unable to load performance summary."} />;
  }
}
