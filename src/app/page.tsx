import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Bell, MoreHorizontal, Wallet } from "lucide-react";
import { PortfolioHero } from "@/components/home/PortfolioHero";
import { PositionRow } from "@/components/positions/PositionRow";
import { QuickActionPill } from "@/components/ui/Pill";
import { POSITIONS } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-muted-2">Good morning</div>
          <div className="text-lg font-semibold">Rayan</div>
        </div>
        <button
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-2 text-foreground"
        >
          <Bell size={18} />
        </button>
      </div>

      <PortfolioHero />

      <div className="mt-5 flex gap-2">
        <Link href="/trade/BTC" className="flex flex-1">
          <QuickActionPill icon={<ArrowUpRight size={20} />} label="Buy" emphasis />
        </Link>
        <Link href="/trade/BTC" className="flex flex-1">
          <QuickActionPill icon={<ArrowDownRight size={20} />} label="Sell" />
        </Link>
        <Link href="/account" className="flex flex-1">
          <QuickActionPill icon={<Wallet size={20} />} label="Deposit" />
        </Link>
        <Link href="/account" className="flex flex-1">
          <QuickActionPill icon={<MoreHorizontal size={20} />} label="More" />
        </Link>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Your positions</h2>
        <Link href="/account" className="text-xs font-medium text-muted-2">
          See all
        </Link>
      </div>
      <div className="mt-1 divide-y divide-border-subtle">
        {POSITIONS.map((position) => (
          <PositionRow key={position.id} position={position} />
        ))}
      </div>
    </div>
  );
}
