"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AssetIcon } from "@/components/ui/AssetIcon";
import { ChangeBadge } from "@/components/ui/Badge";
import { FilterChip } from "@/components/ui/Pill";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatCompact, formatPrice } from "@/lib/calc";
import type { Asset, AssetClass } from "@/lib/types";

const CLASS_TABS: { value: AssetClass | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "crypto", label: "Crypto" },
  { value: "forex", label: "Forex" },
  { value: "commodity", label: "Commodities" },
];

export function MarketsList({ assets }: { assets: Asset[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<AssetClass | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (tab !== "all" && a.assetClass !== tab) return false;
      if (!q) return true;
      return a.display.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    });
  }, [assets, query, tab]);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-2.5">
        <Search size={16} className="text-muted-2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search markets..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-2"
        />
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {CLASS_TABS.map((t) => (
          <FilterChip key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>
            {t.label}
          </FilterChip>
        ))}
      </div>

      <div className="mt-2 divide-y divide-border-subtle">
        {filtered.map((asset) => (
          <Link
            key={asset.symbol}
            href={`/trade/${asset.symbol}`}
            className="flex items-center justify-between gap-3 py-3 transition-opacity active:opacity-70"
          >
            <div className="flex min-w-0 items-center gap-3">
              <AssetIcon symbol={asset.symbol} assetClass={asset.assetClass} />
              <div className="min-w-0">
                <div className="text-sm font-semibold">{asset.display}</div>
                <div className="truncate text-[11px] text-muted-2">{formatCompact(asset.volume24h)} vol</div>
              </div>
            </div>

            <div className="w-16 shrink-0">
              <Sparkline data={asset.sparkline} width={64} height={26} />
            </div>

            <div className="w-24 shrink-0 text-right">
              <div className="font-mono text-sm font-medium tabular-nums">
                {formatPrice(asset.price, asset.decimals)}
              </div>
              <ChangeBadge value={asset.changePct24h} size="sm" plain className="mt-0.5" />
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-2">No markets match &ldquo;{query}&rdquo;.</div>
        )}
      </div>
    </div>
  );
}
