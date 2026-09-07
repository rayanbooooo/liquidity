"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatCompact, formatPct } from "@/lib/calc";
import type { Trader } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TraderCard({ trader }: { trader: Trader }) {
  const router = useRouter();
  const positive = trader.ytdReturnPct >= 0;

  return (
    <div className="flex items-center gap-3 py-3.5">
      <Link href={`/discover/${trader.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar initials={trader.initials} from={trader.accentFrom} to={trader.accentTo} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-semibold">{trader.handle}</span>
            {trader.verified && <BadgeCheck size={14} className="shrink-0 text-long" />}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted-2">
            {formatCompact(trader.followers)} followers · {trader.winRate}% win rate
          </div>
          <div className={cn("mt-0.5 font-mono text-xs font-semibold tabular-nums", positive ? "text-long" : "text-short")}>
            {formatPct(trader.ytdReturnPct)} YTD
          </div>
        </div>
        <div className="w-14 shrink-0">
          <Sparkline data={trader.performance} width={56} height={30} />
        </div>
      </Link>

      <button
        onClick={() => router.push(`/discover/${trader.id}`)}
        className="shrink-0 rounded-lg bg-long px-3.5 py-2 text-xs font-semibold text-black"
      >
        Copy
      </button>
    </div>
  );
}
