import { TraderCard } from "@/components/discover/TraderCard";
import { TRADERS } from "@/lib/mock-data";

export default function DiscoverPage() {
  const ranked = [...TRADERS].sort((a, b) => b.ytdReturnPct - a.ytdReturnPct);

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
      <h1 className="text-xl font-semibold">Discover</h1>
      <p className="mt-1 text-xs text-muted-2">Copy top-performing traders across crypto, forex and commodities.</p>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-muted">Top traders</h2>
        <span className="text-[11px] text-muted-2">Ranked by YTD return</span>
      </div>

      <div className="divide-y divide-border-subtle">
        {ranked.map((trader) => (
          <TraderCard key={trader.id} trader={trader} />
        ))}
      </div>
    </div>
  );
}
