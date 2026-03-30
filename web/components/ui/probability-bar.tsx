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
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{label}</span>
        <span className="font-semibold text-slate-900">{formatPercent(value)}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-200">
        <div className={`h-3 rounded-full ${accent}`} style={{ width: `${Math.max(8, value * 100)}%` }} />
      </div>
    </div>
  );
}
