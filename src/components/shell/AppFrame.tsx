import type { ReactNode } from "react";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-black md:flex md:items-center md:justify-center md:bg-[radial-gradient(ellipse_at_top,#0a0a0c_0%,#000000_60%)] md:p-8">
      <div
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-black md:h-[880px] md:max-h-[92vh] md:w-[428px] md:rounded-[2.75rem] md:border md:border-zinc-800 md:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_60px_120px_-30px_rgba(0,0,0,0.95)]"
        style={{
          backgroundImage: `radial-gradient(ellipse 120% 60% at 50% -10%, rgba(0,230,118,0.05), transparent 60%), ${GRAIN}`,
          backgroundBlendMode: "normal, overlay",
          backgroundSize: "auto, 180px 180px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
