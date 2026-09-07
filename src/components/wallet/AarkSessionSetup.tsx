"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { useConnection, useSignTypedData } from "wagmi";
import {
  authorizeSessionKey,
  deriveAccountId,
  generateSessionKey,
  hashBrokerId,
  registerAccount,
} from "@/lib/aark/orderly-client";
import { getBrokerId } from "@/lib/aark/orderly-config";
import { clearSession, saveSession, useAarkSession } from "@/lib/aark/session-store";

type Step = "idle" | "registering" | "authorizing" | "done" | "error";

export function AarkSessionSetup() {
  const connection = useConnection();
  const { signTypedDataAsync } = useSignTypedData();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  const brokerIdConfigured = Boolean(process.env.NEXT_PUBLIC_AARK_BROKER_ID);
  const connectedAddress = connection.status === "connected" ? connection.address : undefined;
  const session = useAarkSession(connectedAddress);

  async function run() {
    if (connection.status !== "connected") return;
    setError(null);
    try {
      setStep("registering");
      await registerAccount(connection.address, signTypedDataAsync);

      setStep("authorizing");
      const key = generateSessionKey(connection.address);
      await authorizeSessionKey(connection.address, key, signTypedDataAsync);

      const accountId = deriveAccountId(connection.address, hashBrokerId(getBrokerId()));
      saveSession(key, accountId);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep("error");
    }
  }

  function signOut() {
    clearSession();
    setStep("idle");
  }

  if (connection.status !== "connected") return null;

  return (
    <div className="mt-4 rounded-xl bg-surface-2 p-3.5">
      <div className="flex items-center gap-2">
        <KeyRound size={15} className="text-muted-2" />
        <span className="text-xs font-medium text-muted-2">Aark session key</span>
      </div>

      {!brokerIdConfigured ? (
        <p className="mt-2 text-[11px] leading-snug text-muted-2">
          Set <code className="text-foreground">NEXT_PUBLIC_AARK_BROKER_ID</code> to enable this —
          Aark&apos;s broker_id on Orderly Network isn&apos;t confirmed yet (see README).
        </p>
      ) : session ? (
        <div className="mt-2">
          <p className="text-[11px] text-long">Session key authorized (real, persisted).</p>
          <p className="mt-1 truncate font-mono text-[10px] text-muted-2">
            {session.sessionKey.orderlyKeyId}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-2">
            Real order submission and deposits now use this session on the Trade Ticket and Deposit
            flow — for crypto instruments; the deposit struct encoding is a best-effort
            reconstruction, reviewed before every send.
          </p>
          <button onClick={signOut} className="mt-2 text-[11px] font-medium text-muted-2 underline">
            Clear session
          </button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[11px] leading-snug text-muted-2">
            Signs two real EIP-712 messages with your wallet: one registering your account with
            Aark&apos;s Orderly broker, one authorizing a local session key to trade without a wallet
            popup per order. No funds move yet.
          </p>
          <button
            onClick={run}
            disabled={step === "registering" || step === "authorizing"}
            className="mt-3 w-full rounded-xl bg-surface-3 py-2.5 text-xs font-semibold disabled:opacity-60"
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
