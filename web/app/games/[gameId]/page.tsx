import { notFound } from "next/navigation";

import { GamePredictionPanel } from "@/components/games/game-prediction-panel";
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
      <div className="grid gap-6">
        <GamePredictionPanel game={game} />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Matchup summary" eyebrow="Inputs">
            <MatchupSummary game={game} />
          </SectionCard>
          <SectionCard title="Model inputs snapshot" eyebrow="Trace">
            <pre className="overflow-x-auto rounded-[1.5rem] bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(game.modelInputsSnapshot, null, 2)}
            </pre>
          </SectionCard>
        </div>
      </div>
    );
  } catch (error) {
    return <SetupNotice message={error instanceof Error ? error.message : "Unable to load game detail."} />;
  }
}
