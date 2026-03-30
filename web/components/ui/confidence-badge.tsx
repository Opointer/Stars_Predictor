import type { ConfidenceTier } from "@/lib/types";

const toneMap: Record<ConfidenceTier, string> = {
  high: "border-victory/30 bg-victory/10 text-victory",
  medium: "border-caution/30 bg-caution/10 text-caution",
  low: "border-danger/30 bg-danger/10 text-danger"
};

export function ConfidenceBadge({ tier }: { tier: ConfidenceTier }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${toneMap[tier]}`}
    >
      {tier} confidence
    </span>
  );
}
