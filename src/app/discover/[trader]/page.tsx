import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Sparkline } from "@/components/ui/Sparkline";
import { CopySetupForm } from "@/components/discover/CopySetupForm";
import { formatCompact, formatPct } from "@/lib/calc";
import { TRADERS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const RISK_LABEL = { 1: "Low", 2: "Medium", 3: "High" } as const;
const RISK_TONE = { 1: "text-long", 2: "text-warning", 3: "text-short" } as const;

export function generateStaticParams() {
  return TRADERS.map((t) => ({ trader: t.id }));
}

export default async function TraderProfilePage({
  params,
}: {
  params: Promise<{ trader: string }>;
}) {
  const { trader: traderId } = await params;
  const trader = TRADERS.find((t) => t.id === traderId);
  if (!trader) notFound();

  const positive = trader.ytdReturnPct >= 0;

  return (
    <div className="px-5 pb-6 pt-[calc(env(safe-area-inset-top)+16px)]">
      <Link
        href="/discover"
        aria-label="Back to Discover"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface-2"
      >
        <ArrowLeft size={16} />
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <Avatar initials={trader.initials} from={trader.accentFrom} to={trader.accentTo} size={56} />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-semibold">{trader.handle}</span>
            {trader.verified && <BadgeCheck size={16} className="text-long" />}
          </div>
          <div className="text-xs text-muted-2">{formatCompact(trader.followers)} followers</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {trader.tags.map((tag) => (
          <span key={tag} className="rounded-md border border-border-subtle bg-surface-2 px-2 py-1 text-[11px] text-muted">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-border-subtle bg-surface">
        <div className="p-4 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-2">YTD performance</span>
            <span className={cn("font-mono text-lg font-semibold tabular-nums", positive ? "text-long" : "text-short")}>
              {formatPct(trader.ytdReturnPct)}
            </span>
          </div>
          <div className="mt-2">
            <Sparkline data={trader.performance} width={360} height={90} strokeWidth={2} />
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border-subtle border-t border-border-subtle py-3">
          <Stat label="Win rate" value={`${trader.winRate}%`} />
          <Stat label="Risk score" value={RISK_LABEL[trader.riskScore]} valueClassName={RISK_TONE[trader.riskScore]} />
          <Stat label="Trades" value={formatCompact(trader.totalTrades)} />
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">{trader.bio}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {trader.topSymbols.map((s) => (
          <Link
            key={s}
            href={`/trade/${s}`}
            className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px] font-medium text-muted-2"
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-[15px] font-semibold">Copy settings</h2>
        <CopySetupForm trader={trader} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="text-center">
      <div className={cn("text-sm font-semibold", valueClassName)}>{value}</div>
      <div className="mt-0.5 text-[10px] text-muted-2">{label}</div>
    </div>
  );
}
