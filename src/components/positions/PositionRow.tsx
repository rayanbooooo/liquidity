import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { formatPrice, formatSigned, positionRiskTier, unrealizedPnl, unrealizedPnlPct } from "@/lib/calc";
import { getAsset } from "@/lib/mock-data";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AssetIcon } from "@/components/ui/AssetIcon";
import { LeverageBadge, SideBadge } from "@/components/ui/Badge";

export function PositionRow({ position }: { position: Position }) {
  const asset = getAsset(position.symbol);
  if (!asset) return null;

  const pnl = unrealizedPnl(position.entryPrice, asset.price, position.margin, position.leverage, position.side);
  const pnlPct = unrealizedPnlPct(position.entryPrice, asset.price, position.leverage, position.side);
  const risk = positionRiskTier(position.entryPrice, asset.price, position.leverage, position.side);
  const positive = pnl >= 0;

  return (
    <Link
      href={`/trade/${position.symbol}`}
      className="flex items-center justify-between gap-3 py-3 transition-opacity active:opacity-70"
    >
      <div className="flex items-center gap-3">
        <AssetIcon symbol={position.symbol} assetClass={position.assetClass} />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">{asset.display}</span>
            <SideBadge side={position.side} />
            <LeverageBadge value={position.leverage} />
          </div>
          <div className="mt-0.5 flex items-center gap-1">
            {risk.tier === "danger" && <AlertTriangle size={11} className="text-short" />}
            <span
              className={cn(
                "text-[11px] font-medium",
                risk.tier === "danger" ? "text-short" : "text-muted-2",
              )}
            >
              {risk.tier === "danger"
                ? "Near liquidation"
                : `Entry ${formatPrice(position.entryPrice, position.decimals)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className={cn("font-mono text-sm font-semibold tabular-nums", positive ? "text-long" : "text-short")}>
          {formatSigned(pnl)}
        </div>
        <div className={cn("font-mono text-[11px] tabular-nums", positive ? "text-long/70" : "text-short/70")}>
          {positive ? "+" : ""}
          {pnlPct.toFixed(1)}%
        </div>
      </div>
    </Link>
  );
}
