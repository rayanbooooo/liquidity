import type { ReactNode } from "react";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-black md:flex md:items-center md:justify-center md:bg-[radial-gradient(ellipse_at_top,#0a0a0c_0%,#000000_60%)] md:p-8">
      <div
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-black md:h-[880px] md:max-h-[92vh] md:w-[428px] md:rounded-[2.75rem] md:border md:border-zinc-800 md:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_60px_120px_-30px_rgba(0,0,0,0.95)]"
      >
        {children}
      </div>
    </div>
  );
}
