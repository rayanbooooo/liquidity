"use client";

import { useState } from "react";
import { useConnection } from "wagmi";
import { DepositFlow } from "@/components/wallet/DepositFlow";
import { formatUsd } from "@/lib/calc";
import { useAarkSession } from "@/lib/aark/session-store";

export function BalanceCard({ simulatedBalance }: { simulatedBalance: number }) {
  const connection = useConnection();
  const [depositOpen, setDepositOpen] = useState(false);

  const connectedAddress = connection.status === "connected" ? connection.address : undefined;
  const session = useAarkSession(connectedAddress);

  return (
    <div className="mt-5 rounded-3xl border border-border-subtle bg-surface p-5">
      <div className="text-xs font-medium text-muted-2">Simulated balance</div>
      <div className="mt-1 font-mono text-4xl font-semibold tracking-tight tabular-nums">
        {formatUsd(simulatedBalance)}
      </div>
      <button
        onClick={() => setDepositOpen((v) => !v)}
        disabled={!session}
        className="mt-4 w-full rounded-xl bg-long py-3 text-sm font-semibold text-black disabled:opacity-40"
      >
        Deposit
      </button>
      {!session && (
        <p className="mt-2 text-center text-[11px] text-muted-2">
          Set up an Aark session key below to enable a real deposit.
        </p>
      )}

      {depositOpen && session && <DepositFlow onClose={() => setDepositOpen(false)} />}
    </div>
  );
}
