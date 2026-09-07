import { notFound } from "next/navigation";
import { AssetHeader } from "@/components/trade/AssetHeader";
import { PriceChart } from "@/components/trade/PriceChart";
import { OrderTicket } from "@/components/trade/OrderTicket";
import { ASSETS, getAsset } from "@/lib/mock-data";

export function generateStaticParams() {
  return ASSETS.map((a) => ({ ticker: a.symbol }));
}

export default async function TradeTicketPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const asset = getAsset(ticker);
  if (!asset) notFound();

  return (
    <div className="pb-4">
      <AssetHeader asset={asset} />
      <div className="mt-4">
        <PriceChart symbol={asset.symbol} decimals={asset.decimals} />
      </div>
      <div className="mt-2">
        <OrderTicket asset={asset} />
      </div>
    </div>
  );
}
