"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useConnection, useSendTransaction } from "wagmi";
import { buildDepositCalldata, decodeDepositForReview, encodeUsdcApproval } from "@/lib/aark/orderly-client";
import { ORDERLY_VAULT_PROXY_ARBITRUM } from "@/lib/aark/orderly-config";
import type { DecodedDeposit } from "@/lib/aark/orderly-types";

type Stage = "input" | "review" | "approving" | "depositing" | "done" | "error";

export function DepositFlow({ onClose }: { onClose: () => void }) {
  const connection = useConnection();
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [decoded, setDecoded] = useState<DecodedDeposit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (connection.status !== "connected") return null;

  const amountNum = parseFloat(amount) || 0;

  function review() {
    if (amountNum <= 0 || connection.status !== "connected") return;
    setDecoded(decodeDepositForReview(connection.address, amountNum));
    setStage("review");
  }

  async function confirmDeposit() {
    if (!decoded || connection.status !== "connected") return;
    setError(null);
    try {
      setStage("approving");
      const approval = encodeUsdcApproval(ORDERLY_VAULT_PROXY_ARBITRUM, BigInt(Math.round(amountNum * 1_000_000)));
      await sendTransaction({ to: approval.to, data: approval.data });

      setStage("depositing");
      const deposit = buildDepositCalldata(connection.address, amountNum);
      const hash = await sendTransaction({ to: deposit.to, data: deposit.data });

      setTxHash(hash);
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStage("error");
    }
  }

  return (
    <div className="mt-3 rounded-xl bg-surface-2 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-2">Deposit USDC to Aark</span>
        <button onClick={onClose} className="text-[11px] text-muted-2 underline">
          Close
        </button>
      </div>

      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-warning/10 p-2.5 text-[11px] leading-snug text-warning">
        <TriangleAlert size={13} className="mt-0.5 shrink-0" />
        <span>
          The deposit contract call is a best-effort reconstruction (real event signatures + a
          documented derivation rule, not the confirmed struct source) — review the decoded fields
          below against Aark&apos;s own app before sending anything you can&apos;t afford to lose.
        </span>
      </div>

      {stage === "input" && (
        <>
          <div className="mt-3 flex items-center rounded-lg border border-border-subtle bg-surface-3 px-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="w-full bg-transparent py-3 font-mono text-base tabular-nums outline-none placeholder:text-muted-2"
            />
            <span className="text-xs text-muted-2">USDC</span>
          </div>
          <button
            onClick={review}
            disabled={amountNum <= 0}
            className="mt-3 w-full rounded-xl bg-surface-3 py-2.5 text-xs font-semibold disabled:opacity-60"
          >
            Review deposit
          </button>
        </>
      )}

      {stage === "review" && decoded && (
        <div className="mt-3 space-y-1.5">
          <ReviewRow label="Amount" value={`${decoded.amountUsdc} USDC`} />
          <ReviewRow label="Vault" value={decoded.vaultAddress} mono />
          <ReviewRow label="Account ID" value={decoded.accountId} mono />
          <ReviewRow label="Broker hash" value={decoded.brokerHash} mono />
          <ReviewRow label="Token hash" value={decoded.tokenHash} mono />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setStage("input")}
              className="flex-1 rounded-xl bg-surface-3 py-2.5 text-xs font-semibold"
            >
              Back
            </button>
            <button
              onClick={confirmDeposit}
              className="flex-1 rounded-xl bg-warning py-2.5 text-xs font-semibold text-black"
            >
              Approve & deposit
            </button>
          </div>
        </div>
      )}

      {(stage === "approving" || stage === "depositing") && (
        <p className="mt-3 text-[11px] text-muted-2">
          {stage === "approving" ? "Confirm USDC approval in your wallet..." : "Confirm deposit in your wallet..."}
        </p>
      )}

      {stage === "done" && (
        <div className="mt-3">
          <p className="text-[11px] text-long">
            Deposit transaction sent{txHash ? ` — ${txHash.slice(0, 10)}...` : ""}. Confirm it landed
            (and credited the right account) on Arbiscan before relying on it.
          </p>
          <button onClick={onClose} className="mt-2 text-[11px] font-medium text-muted-2 underline">
            Done
          </button>
        </div>
      )}

      {stage === "error" && error && (
        <p className="mt-3 text-[11px] text-short">Deposit failed: {error}</p>
      )}
    </div>
  );
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-[11px] text-muted-2">{label}</span>
      <span className={`truncate text-right text-[11px] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
