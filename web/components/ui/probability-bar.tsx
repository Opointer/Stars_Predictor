import { formatPercent } from "@/lib/formatters";

export function ProbabilityBar({
  label,
  value,
  accent = "bg-stars-green"
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <span className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</span>
        <span className="font-display text-3xl font-semibold leading-none text-white">{formatPercent(value)}</span>
      </div>
      <div className="h-3 rounded-full bg-white/8">
        <div
          className={`h-3 rounded-full shadow-[0_0_20px_rgba(111,211,165,0.28)] ${accent}`}
          style={{ width: `${Math.max(8, value * 100)}%` }}
        />
      </div>
    </div>
  );
}
