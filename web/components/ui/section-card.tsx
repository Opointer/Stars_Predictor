import type { ReactNode } from "react";

export function SectionCard({
  title,
  eyebrow,
  children,
  className = ""
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-panel ${className}`}>
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-stars-green">{eyebrow}</p> : null}
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
