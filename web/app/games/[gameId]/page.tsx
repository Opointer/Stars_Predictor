import { notFound } from "next/navigation";

import { GamePredictionPanel } from "@/components/games/game-prediction-panel";
import { KeyDriversPanel } from "@/components/games/key-drivers-panel";
import { MatchupSummary } from "@/components/games/matchup-summary";
import { SectionCard } from "@/components/ui/section-card";
import { SetupNotice } from "@/components/ui/setup-notice";
import { getGameDetail } from "@/lib/queries/dashboard";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  try {
    const game = await getGameDetail(Number(gameId));

    if (!game) {
      notFound();
    }

    return (
      <div className="grid gap-5 xl:gap-6">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stars-mint">Matchup analysis</p>
            <h1 className="mt-3 font-display text-5xl font-semibold uppercase tracking-[0.04em] text-white 2xl:text-[4.15rem]">Game detail</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              A premium intelligence briefing for the selected matchup, with model rationale and interpretable matchup inputs.
            </p>
          </div>
        </section>
        <GamePredictionPanel game={game} />
        <div className="mx-auto grid w-full max-w-[1520px] gap-5 2xl:grid-cols-[1.2fr_0.8fr] 2xl:items-start">
          <SectionCard title="Matchup summary" eyebrow="Inputs" tone="highlight" className="px-6 py-6 lg:px-8 lg:py-8">
            <MatchupSummary game={game} />
          </SectionCard>
          <SectionCard title="Why the model leans this way" eyebrow="Interpretation" tone="muted" className="px-6 py-6 lg:px-8 lg:py-8">
            <KeyDriversPanel game={game} />
          </SectionCard>
        </div>
      </div>
    );
  } catch (error) {
    return <SetupNotice message={error instanceof Error ? error.message : "Unable to load game detail."} />;
  }
}
