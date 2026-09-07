"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { useConnection, useSignTypedData } from "wagmi";
import {
  authorizeSessionKey,
  generateSessionKey,
  registerAccount,
} from "@/lib/aark/orderly-client";
import type { OrderlySessionKey } from "@/lib/aark/orderly-types";

type Step = "idle" | "registering" | "authorizing" | "done" | "error";

export function AarkSessionSetup() {
  const connection = useConnection();
  const { signTypedDataAsync } = useSignTypedData();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<OrderlySessionKey | null>(null);

  const brokerIdConfigured = Boolean(process.env.NEXT_PUBLIC_AARK_BROKER_ID);

  async function run() {
    if (connection.status !== "connected") return;
    setError(null);
    try {
      setStep("registering");
      await registerAccount(connection.address, signTypedDataAsync);

      setStep("authorizing");
      const key = generateSessionKey(connection.address);
      await authorizeSessionKey(connection.address, key, signTypedDataAsync);

      setSessionKey(key);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep("error");
    }
  }

  if (connection.status !== "connected") return null;

  return (
    <div className="mt-4 rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center gap-2">
        <KeyRound size={15} className="text-muted-2" />
        <span className="text-xs font-medium text-muted-2">Aark session key</span>
      </div>

      {!brokerIdConfigured ? (
        <p className="mt-2 text-[11px] leading-snug text-muted-2">
          Set <code className="text-foreground">NEXT_PUBLIC_AARK_BROKER_ID</code> to enable this —
          Aark&apos;s broker_id on Orderly Network isn&apos;t confirmed yet (see README).
        </p>
      ) : step === "done" && sessionKey ? (
        <div className="mt-2">
          <p className="text-[11px] text-long">Session key authorized (two wallet signatures, real).</p>
          <p className="mt-1 truncate font-mono text-[10px] text-muted-2">{sessionKey.orderlyKeyId}</p>
          <p className="mt-1.5 text-[11px] text-muted-2">
            Placing an order with it needs a confirmed account_id from the registration response —
            not wired into the Trade Ticket yet.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[11px] leading-snug text-muted-2">
            Signs two real EIP-712 messages with your wallet: one registering your account with
            Aark&apos;s Orderly broker, one authorizing a local session key to trade without a wallet
            popup per order. No funds move — this doesn&apos;t deposit or place any order.
          </p>
          <button
            onClick={run}
            disabled={step === "registering" || step === "authorizing"}
            className="mt-3 w-full rounded-xl border border-border-subtle bg-surface-2 py-2.5 text-xs font-semibold disabled:opacity-60"
          >
            {step === "registering"
              ? "Confirm registration in wallet..."
              : step === "authorizing"
                ? "Confirm session key in wallet..."
                : "Register & authorize session key"}
          </button>
          {error && <p className="mt-2 text-[11px] text-short">{error}</p>}
        </>
      )}
    </div>
  );
}
