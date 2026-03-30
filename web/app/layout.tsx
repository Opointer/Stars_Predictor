import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Stars Predictor",
  description: "Dallas Stars game forecasts built on a transparent baseline model."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PageShell>
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </PageShell>
      </body>
    </html>
  );
}
