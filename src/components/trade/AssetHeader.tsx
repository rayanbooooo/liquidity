import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChangeBadge } from "@/components/ui/Badge";
import { AssetIcon } from "@/components/ui/AssetIcon";
import { FavoriteButton } from "@/components/trade/FavoriteButton";
import { formatCompact, formatPrice } from "@/lib/calc";
import { getCandleSeries } from "@/lib/mock-data";
import type { Asset } from "@/lib/types";

export function AssetHeader({ asset }: { asset: Asset }) {
  const dayCandles = getCandleSeries(asset.symbol, "1H").slice(-24);
  const open = dayCandles[0]?.open ?? asset.price;
  const high = Math.max(...dayCandles.map((c) => c.high));
  const low = Math.min(...dayCandles.map((c) => c.low));

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
      <div className="flex items-center justify-between">
        <Link
          href="/markets"
          aria-label="Back to markets"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface-2"
        >
          <ArrowLeft size={16} />
        </Link>
        <FavoriteButton />
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <AssetIcon symbol={asset.symbol} assetClass={asset.assetClass} size={32} />
        <div>
          <div className="text-base font-semibold leading-tight">{asset.display}</div>
          <div className="text-xs leading-tight text-muted-2">{asset.name} · Perpetual</div>
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-[2rem] font-semibold leading-none tracking-tight tabular-nums">
          {formatPrice(asset.price, asset.decimals)}
        </span>
        <ChangeBadge value={asset.changePct24h} size="lg" />
      </div>

      <div className="mt-4 grid grid-cols-4 divide-x divide-border-subtle border-y border-border-subtle py-2.5">
        <Stat label="Open" value={formatPrice(open, asset.decimals)} />
        <Stat label="High" value={formatPrice(high, asset.decimals)} tone="long" />
        <Stat label="Low" value={formatPrice(low, asset.decimals)} tone="short" />
        <Stat label="Volume" value={formatCompact(asset.volume24h)} />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "long" | "short" }) {
  return (
    <div className="px-2.5 first:pl-0">
      <div className="text-[10px] font-medium text-muted-2">{label}</div>
      <div
        className={
          "font-mono text-xs font-medium tabular-nums " +
          (tone === "long" ? "text-long" : tone === "short" ? "text-short" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
