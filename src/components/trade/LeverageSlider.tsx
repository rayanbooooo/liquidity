"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { LEVERAGE_PRESETS } from "@/lib/mock-data";

function tierColor(leverage: number): string {
  if (leverage <= 10) return "var(--long)";
  if (leverage <= 100) return "var(--warning)";
  return "var(--short)";
}

function tierLabel(leverage: number): string {
  if (leverage <= 10) return "Conservative";
  if (leverage <= 50) return "Moderate";
  if (leverage <= 200) return "Aggressive";
  return "Extreme";
}

export function LeverageSlider({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const steps = useMemo(() => {
    const filtered = LEVERAGE_PRESETS.filter((p) => p <= max);
    if (filtered[filtered.length - 1] !== max) filtered.push(max);
    return filtered;
  }, [max]);

  const index = useMemo(() => {
    let closest = 0;
    let closestDiff = Infinity;
    steps.forEach((s, i) => {
      const diff = Math.abs(s - value);
      if (diff < closestDiff) {
        closestDiff = diff;
        closest = i;
      }
    });
    return closest;
  }, [steps, value]);

  const gradient = useMemo(() => {
    const stops = steps.map((s, i) => {
      const pct = (i / (steps.length - 1)) * 100;
      return `${tierColor(s)} ${pct}%`;
    });
    return `linear-gradient(to right, ${stops.join(", ")})`;
  }, [steps]);

  const color = tierColor(value);

  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="font-mono text-3xl font-semibold tabular-nums" style={{ color }}>
            {value}x
          </div>
          <div className="text-xs font-medium" style={{ color }}>
            {tierLabel(value)}
          </div>
        </div>
        <span className="text-xs text-muted-2">Max {max}x</span>
      </div>

      <input
        type="range"
        min={0}
        max={steps.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(steps[Number(e.target.value)])}
        style={{ background: gradient }}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full outline-none",
          "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent",
          "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent",
          "[&::-webkit-slider-thumb]:mt-[-8px] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.6)]",
          "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.6)]",
        )}
      />

      <div className="mt-3 flex flex-wrap gap-1.5">
        {steps.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={cn(
              "rounded-md px-2 py-1 font-mono text-[11px] font-medium tabular-nums transition-colors",
              s === value
                ? "bg-foreground text-black"
                : "bg-surface-2 text-muted hover:text-foreground",
            )}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
