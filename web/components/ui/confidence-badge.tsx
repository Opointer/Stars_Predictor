import type { ConfidenceTier } from "@/lib/types";

const toneMap: Record<ConfidenceTier, string> = {
  high: "bg-victory/15 text-victory",
  medium: "bg-caution/20 text-slate-900",
  low: "bg-danger/15 text-danger"
};

export function ConfidenceBadge({ tier }: { tier: ConfidenceTier }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneMap[tier]}`}>
      {tier} confidence
    </span>
  );
}
