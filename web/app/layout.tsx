import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Barlow_Condensed, JetBrains_Mono, Manrope } from "next/font/google";

import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono"
});

export const metadata: Metadata = {
  title: "Stars Predictor",
  description: "Dallas Stars game forecasts built on a transparent baseline model."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${barlow.variable} ${jetbrainsMono.variable}`}>
        <PageShell>
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </PageShell>
      </body>
    </html>
  );
}
