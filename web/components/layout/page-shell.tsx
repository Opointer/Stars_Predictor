import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-grid mx-auto flex min-h-screen w-full max-w-[1760px] flex-col px-4 pb-12 pt-5 sm:px-6 xl:px-10 2xl:px-12">
      {children}
    </div>
  );
}
