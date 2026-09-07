import { formatUsd } from "@/lib/calc";
import { MARGIN_SUMMARY } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function marginTier(usedPct: number): { label: string; color: string } {
  if (usedPct < 30) return { label: "Healthy", color: "var(--long)" };
  if (usedPct < 60) return { label: "Moderate", color: "var(--warning)" };
  return { label: "At risk", color: "var(--short)" };
}

export function RiskOverview() {
  const { walletBalance, marginUsed, unrealizedPnl, totalEquity } = MARGIN_SUMMARY;
  const usedPct = (marginUsed / totalEquity) * 100;
  const tier = marginTier(usedPct);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-2">Margin health</span>
        <span className="text-xs font-semibold" style={{ color: tier.color }}>
          {tier.label} · {usedPct.toFixed(0)}% used
        </span>
      </div>

      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, usedPct)}%`, background: tier.color }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Tile label="Available" value={formatUsd(walletBalance, 0)} />
        <Tile label="In margin" value={formatUsd(marginUsed, 0)} />
        <Tile
          label="Unrealized"
          value={formatUsd(unrealizedPnl, 0)}
          valueClassName={unrealizedPnl >= 0 ? "text-long" : "text-short"}
        />
      </div>
    </div>
  );
}

function Tile({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-2.5 text-center">
      <div className={cn("font-mono text-xs font-semibold tabular-nums", valueClassName)}>{value}</div>
      <div className="mt-0.5 text-[10px] text-muted-2">{label}</div>
    </div>
  );
}
