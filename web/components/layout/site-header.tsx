"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SITE_NAME } from "@/lib/constants/site";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/performance", label: "Performance" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="panel-surface mb-8 overflow-hidden rounded-[2rem]">
      <div className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-stars-green/15 text-lg font-semibold text-stars-mint shadow-glow">
            SP
          </div>
          <div>
            <Link href="/" className="font-display text-3xl font-semibold uppercase tracking-[0.08em] text-white">
              {SITE_NAME}
            </Link>
            <p className="mt-1 text-sm text-slate-300">Dallas Stars forecasting desk with transparent baseline intelligence.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-stars-mint" />
            Live NHL data environment
          </div>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-stars-night shadow-glow"
                      : "border border-white/10 bg-white/[0.03] text-slate-200 hover:border-stars-mint/50 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
