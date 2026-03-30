import { formatPercent } from "@/lib/formatters";

export function MetricBar({
  label,
  value,
  max = 1,
  inverse = false
}: {
  label: string;
  value: number;
  max?: number;
  inverse?: boolean;
}) {
  const width = Math.max(4, Math.min(100, (value / max) * 100));
  const accent = inverse ? "bg-caution" : "bg-stars-green";

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <span className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</span>
        <span className="font-display text-3xl font-semibold leading-none text-white">
          {max === 1 ? formatPercent(value, 1) : value.toFixed(3)}
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/8">
        <div className={`h-3 rounded-full ${accent}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
