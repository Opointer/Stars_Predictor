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
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>{label}</span>
        <span className="font-semibold">{max === 1 ? formatPercent(value, 1) : value.toFixed(3)}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-200">
        <div className={`h-3 rounded-full ${accent}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
