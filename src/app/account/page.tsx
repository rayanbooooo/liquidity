import {
  ChevronRight,
  CircleHelp,
  Landmark,
  Settings as SettingsIcon,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { RiskOverview } from "@/components/account/RiskOverview";
import { PositionRow } from "@/components/positions/PositionRow";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { formatUsd } from "@/lib/calc";
import { MARGIN_SUMMARY, POSITIONS } from "@/lib/mock-data";

const SETTINGS_ROWS = [
  { icon: UserRound, label: "Personal details" },
  { icon: ShieldCheck, label: "Verification" },
  { icon: Landmark, label: "Funding & withdrawals" },
  { icon: SettingsIcon, label: "Settings" },
  { icon: CircleHelp, label: "Help & support" },
];

export default function AccountPage() {
  return (
    <div className="px-5 pb-6 pt-[calc(env(safe-area-inset-top)+20px)]">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-lg font-semibold">
          RK
        </div>
        <div>
          <div className="text-base font-semibold">Rayan Kerkab</div>
          <div className="flex items-center gap-1 text-xs text-long">
            <ShieldCheck size={12} />
            Verified account
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border-subtle bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-2">On-chain wallet</span>
          <span className="text-[10px] font-medium text-muted-2">Arbitrum One</span>
        </div>
        <div className="mt-2">
          <ConnectWalletButton />
        </div>
        <p className="mt-2.5 text-[11px] leading-snug text-muted-2">
          Connecting a wallet is real. Trading against Aark Digital isn&apos;t wired up yet — the
          balance below and every order in this app is still simulated.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-border-subtle bg-surface p-4">
        <div className="text-xs font-medium text-muted-2">Simulated balance</div>
        <div className="mt-1 font-mono text-3xl font-semibold tabular-nums">
          {formatUsd(MARGIN_SUMMARY.totalEquity)}
        </div>
        <button className="mt-3 w-full rounded-xl bg-long py-3 text-sm font-semibold text-black">
          Deposit
        </button>
      </div>

      <div className="mt-4">
        <RiskOverview />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Active positions</h2>
        <span className="text-xs text-muted-2">{POSITIONS.length} open</span>
      </div>
      <div className="mt-1 divide-y divide-border-subtle">
        {POSITIONS.map((position) => (
          <PositionRow key={position.id} position={position} />
        ))}
      </div>

      <div className="mt-7">
        <h2 className="mb-1 text-[15px] font-semibold">Settings</h2>
        <div className="divide-y divide-border-subtle">
          {SETTINGS_ROWS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 py-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted">
                <Icon size={16} />
              </span>
              <span className="flex-1 text-sm">{label}</span>
              <ChevronRight size={16} className="text-muted-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
