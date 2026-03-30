import Link from "next/link";

import { SITE_NAME } from "@/lib/constants/site";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/performance", label: "Performance" }
];

export function SiteHeader() {
  return (
    <header className="mb-8 flex flex-col gap-4 rounded-[2rem] bg-stars-night px-6 py-5 text-white shadow-panel sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          {SITE_NAME}
        </Link>
        <p className="mt-1 text-sm text-slate-300">Dallas Stars game forecasts with a transparent baseline model.</p>
      </div>
      <nav className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-100 transition hover:border-stars-mint hover:text-stars-mint"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
