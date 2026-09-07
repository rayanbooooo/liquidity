"use client";

import { useState } from "react";
import { formatSigned, formatUsd, seriesChange } from "@/lib/calc";
import { MARGIN_SUMMARY, PORTFOLIO_SERIES, TIMEFRAMES } from "@/lib/mock-data";
import type { Timeframe } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/ui/Sparkline";

export function PortfolioHero() {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const series = PORTFOLIO_SERIES[timeframe];
  const change = seriesChange(series);
  const positive = change.abs >= 0;

  return (
    <div className="rounded-3xl border border-border-subtle bg-surface p-5">
      <div className="text-xs font-medium text-muted-2">Total portfolio value</div>
      <div className="mt-1.5 font-mono text-[2.25rem] font-semibold leading-none tracking-tight tabular-nums">
        {formatUsd(MARGIN_SUMMARY.totalEquity)}
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-medium tabular-nums",
            positive ? "bg-long-dim text-long" : "bg-short-dim text-short",
          )}
        >
          {formatSigned(change.abs)} ({positive ? "+" : ""}
          {change.pct.toFixed(2)}%)
        </span>
        <span className="text-xs text-muted-2">
          {timeframe === "1D" ? "today" : timeframe === "ALL" ? "all time" : `past ${timeframe.toLowerCase()}`}
        </span>
      </div>

      <div className="-mx-5 mt-4">
        <Sparkline data={series} width={400} height={110} tone={positive ? "long" : "short"} strokeWidth={2} />
      </div>

      <div className="mt-3 grid grid-flow-col auto-cols-fr gap-1 rounded-xl bg-surface-2 p-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={cn(
              "rounded-lg py-1.5 text-[11px] font-semibold transition-colors",
              timeframe === tf ? "bg-foreground text-black" : "text-muted-2 hover:text-foreground",
            )}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}
