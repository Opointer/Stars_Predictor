import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
