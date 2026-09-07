"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { formatUsd } from "@/lib/calc";
import { WALLET_BALANCE } from "@/lib/mock-data";
import type { Trader } from "@/lib/types";

const RISK_OPTIONS = [
  { value: "low" as const, label: "Low" },
  { value: "medium" as const, label: "Medium" },
  { value: "high" as const, label: "High" },
];

const ALLOCATION_PRESETS = [250, 500, 1000, 2500];

export function CopySetupForm({ trader }: { trader: Trader }) {
  const [allocation, setAllocation] = useState(500);
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [stopLoss, setStopLoss] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const sliderMax = Math.max(2500, Math.min(5000, Math.ceil(WALLET_BALANCE / 500) * 500));
  const pctOfBalance = (allocation / WALLET_BALANCE) * 100;
  const sliderFillPct = (allocation / sliderMax) * 100;

  function start() {
    setConfirmed(true);
    window.setTimeout(() => setConfirmed(false), 3200);
  }

  return (
    <div className="rounded-3xl border border-border-subtle bg-surface p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-2">Allocation</span>
        <span className="font-mono text-xs text-muted-2">{pctOfBalance.toFixed(0)}% of balance</span>
      </div>
      <div className="font-mono text-2xl font-semibold tabular-nums">{formatUsd(allocation, 0)}</div>
      <input
        type="range"
        min={100}
        max={sliderMax}
        step={50}
        value={allocation}
        onChange={(e) => setAllocation(Number(e.target.value))}
        className={[
          "mt-3 h-2 w-full cursor-pointer appearance-none rounded-full outline-none",
          "[&::-webkit-slider-thumb]:mt-[-8px] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-long [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.6)]",
          "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:bg-long",
        ].join(" ")}
        style={{
          background: `linear-gradient(to right, var(--long) ${sliderFillPct}%, var(--surface-3) ${sliderFillPct}%)`,
        }}
      />
      <div className="mt-3 flex gap-1.5">
        {ALLOCATION_PRESETS.map((v) => (
          <button
            key={v}
            onClick={() => setAllocation(v)}
            className={[
              "rounded-md px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums transition-colors",
              allocation === v ? "bg-foreground text-black" : "bg-surface-2 text-muted hover:text-foreground",
            ].join(" ")}
          >
            {formatUsd(v, 0)}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="mb-1.5 text-xs font-medium text-muted-2">Risk level</div>
        <SegmentedControl options={RISK_OPTIONS} value={risk} onChange={setRisk} />
        <p className="mt-1.5 text-[11px] text-muted-2">
          {risk === "low" && "Scales this trader's position sizing down for smaller swings."}
          {risk === "medium" && "Mirrors this trader's position sizing proportionally to your allocation."}
          {risk === "high" && "Scales position sizing up — larger swings in both directions."}
        </p>
      </div>

      <button
        onClick={() => setStopLoss((v) => !v)}
        className="mt-5 flex w-full items-center justify-between"
      >
        <div className="text-left">
          <div className="text-xs font-medium">Stop copying if loss exceeds 20%</div>
          <div className="text-[11px] text-muted-2">Auto-pauses this copy relationship</div>
        </div>
        <span
          className={[
            "relative h-6 w-10 shrink-0 rounded-full transition-colors",
            stopLoss ? "bg-long" : "bg-surface-3",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
              stopLoss ? "translate-x-[18px]" : "translate-x-0.5",
            ].join(" ")}
          />
        </span>
      </button>

      <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-3 text-xs">
        <span className="text-muted-2">Monthly copy fee</span>
        <span className="font-mono font-medium">{formatUsd(trader.monthlyFeeUsd)}</span>
      </div>

      {confirmed && (
        <div className="mt-3 rounded-lg bg-long-dim px-3 py-2 text-xs font-medium text-long">
          Now copying {trader.handle} with {formatUsd(allocation, 0)} allocated · Demo only.
        </div>
      )}

      <Button variant="long" size="lg" className="mt-4 w-full" onClick={start}>
        Start Copying {trader.handle}
      </Button>
      <p className="mt-2 text-center text-[10px] text-muted-2">You can stop copying anytime.</p>
    </div>
  );
}
