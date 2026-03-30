export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <h3 className="font-display text-2xl font-semibold uppercase tracking-[0.05em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}
