import type { ReactNode } from "react";

export function SectionCard({
  title,
  eyebrow,
  children,
  className = "",
  tone = "default"
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "highlight";
}) {
  const toneClass =
    tone === "highlight"
      ? "border-stars-mint/20 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-stars-green/10"
      : tone === "muted"
        ? "border-white/8 bg-white/[0.03]"
        : "border-white/10 bg-white/[0.045]";

  return (
    <section className={`panel-surface rounded-[1.75rem] p-6 ${toneClass} ${className}`}>
      {eyebrow ? <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-stars-mint">{eyebrow}</p> : null}
      <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.06em] text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
