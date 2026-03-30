import type { GameDetailView } from "@/lib/types";

function formatTeamPossessive(name: string) {
  return name.endsWith("s") ? `${name}'` : `${name}'s`;
}

function buildComparativeBullet({
  edge,
  favoredLabel,
  opposingLabel,
  strongerPhrase,
  balancedPhrase,
  threshold
}: {
  edge: number;
  favoredLabel: string;
  opposingLabel: string;
  strongerPhrase: string;
  balancedPhrase: string;
  threshold: number;
}) {
  if (Math.abs(edge) < threshold) {
    return balancedPhrase;
  }

  return edge > 0
    ? `${favoredLabel} ${strongerPhrase} than ${opposingLabel}.`
    : `${opposingLabel} ${strongerPhrase} than ${favoredLabel}.`;
}

export function KeyDriversPanel({ game }: { game: GameDetailView }) {
  const starsLabel = "Dallas";
  const opponentLabel = game.opponentName;
  const favoriteName = game.starsWinProbability >= 0.5 ? "Dallas" : opponentLabel;

  const winRateEdge = game.featureSummary.starsRecentWinPct - game.featureSummary.opponentRecentWinPct;
  const goalDiffEdge = game.featureSummary.starsGoalDiffRecent - game.featureSummary.opponentGoalDiffRecent;
  const splitEdge = game.featureSummary.starsSplitWinPct - game.featureSummary.opponentSplitWinPct;
  const restEdge = game.featureSummary.starsRestDays - game.featureSummary.opponentRestDays;

  const bullets = [
    buildComparativeBullet({
      edge: winRateEdge,
      favoredLabel: starsLabel,
      opposingLabel: opponentLabel,
      strongerPhrase: "owns the stronger recent win rate",
      balancedPhrase: `Recent win rate is nearly even between ${starsLabel} and ${opponentLabel}.`,
      threshold: 0.04
    }),
    buildComparativeBullet({
      edge: goalDiffEdge,
      favoredLabel: starsLabel,
      opposingLabel: opponentLabel,
      strongerPhrase: "has the better recent goal differential",
      balancedPhrase: "Recent goal differential is largely neutral in this matchup.",
      threshold: 0.2
    }),
    buildComparativeBullet({
      edge: splitEdge,
      favoredLabel: formatTeamPossessive(starsLabel),
      opposingLabel: formatTeamPossessive(opponentLabel),
      strongerPhrase: "venue split has been more reliable",
      balancedPhrase: "Venue split signals are mixed, with neither side holding a clear edge.",
      threshold: 0.05
    }),
    Math.abs(restEdge) < 1
      ? "Rest is effectively even, so schedule fatigue is not moving the projection much."
      : restEdge > 0
        ? `Dallas comes in with the rest advantage, which slightly helps the expected game script.`
        : `${opponentLabel} comes in with the rest advantage, which slightly improves its setup.`
  ];

  if (game.featureSummary.homeIceAdvantage > 0) {
    bullets.push(
      game.isHome
        ? "Home ice adds a modest baseline bump for Dallas."
        : `Home ice gives ${opponentLabel} a small built-in edge before form factors are applied.`
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-5 py-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-stars-mint">Key drivers</p>
        <h3 className="mt-3 font-display text-3xl font-semibold uppercase tracking-[0.05em] text-white">
          Why the model leans toward {favoriteName}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
          This summary translates the current matchup inputs into the clearest forces shaping the projection.
        </p>
      </div>
      <div className="grid gap-3">
        {bullets.slice(0, 5).map((bullet) => (
          <div key={bullet} className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-5 py-4">
            <p className="text-sm leading-7 text-slate-200">{bullet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
