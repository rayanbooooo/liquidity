import { MarketsList } from "@/components/markets/MarketsList";
import { ASSETS } from "@/lib/mock-data";

export default function MarketsPage() {
  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
      <h1 className="mb-4 text-xl font-semibold">Markets</h1>
      <MarketsList assets={ASSETS} />
    </div>
  );
}
