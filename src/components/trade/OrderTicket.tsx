"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, TriangleAlert } from "lucide-react";
import { useConnection } from "wagmi";
import { Button } from "@/components/ui/Button";
import { LongShortToggle, SegmentedControl } from "@/components/ui/SegmentedControl";
import { LeverageSlider } from "@/components/trade/LeverageSlider";
import { formatPrice, formatUsd, liquidationPrice } from "@/lib/calc";
import { WALLET_BALANCE } from "@/lib/mock-data";
import type { Asset, OrderType, Side } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getOrderlyInstrument } from "@/lib/aark/orderly-config";
import { submitOrder } from "@/lib/aark/orderly-client";
import { useAarkSession } from "@/lib/aark/session-store";

const ORDER_TYPE_OPTIONS = [
  { value: "market" as OrderType, label: "Market" },
  { value: "limit" as OrderType, label: "Limit" },
  { value: "stop" as OrderType, label: "Stop" },
];

const TAKER_FEE_RATE = 0.0005;

function qtyDecimals(price: number): number {
  if (price >= 1000) return 5;
  if (price >= 1) return 3;
  return 0;
}

function tierColor(leverage: number): string {
  if (leverage <= 10) return "var(--long)";
  if (leverage <= 100) return "var(--warning)";
  return "var(--short)";
}

export function OrderTicket({ asset }: { asset: Asset }) {
  const connection = useConnection();
  const [side, setSide] = useState<Side>("long");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [leverage, setLeverage] = useState(Math.min(10, asset.maxLeverage));
  const [inputMode, setInputMode] = useState<"base" | "usd">("usd");
  const [amountInput, setAmountInput] = useState("");
  const [limitPriceInput, setLimitPriceInput] = useState(() => asset.price.toFixed(asset.decimals));
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const connectedAddress = connection.status === "connected" ? connection.address : undefined;
  const session = useAarkSession(connectedAddress);
  const orderlyInstrument = getOrderlyInstrument(asset.symbol);
  const realOrdersAvailable = Boolean(session && orderlyInstrument);

  const entryPrice = orderType === "market" ? asset.price : parseFloat(limitPriceInput) || asset.price;
  const amountValue = parseFloat(amountInput) || 0;
  const notional = inputMode === "usd" ? amountValue : amountValue * entryPrice;
  const qty = entryPrice > 0 ? notional / entryPrice : 0;
  const margin = leverage > 0 ? notional / leverage : 0;
  const fee = notional * TAKER_FEE_RATE;
  const estimatedCost = margin + fee;
  const liqPrice = liquidationPrice(entryPrice, leverage, side);
  const liqMovePct = 100 / leverage;
  const insufficientBalance = estimatedCost > WALLET_BALANCE && notional > 0;
  const canSubmit = notional > 0 && !insufficientBalance;

  const decimals = qtyDecimals(asset.price);
  const color = tierColor(leverage);

  const formattedQty = useMemo(() => {
    if (!Number.isFinite(qty)) return "0";
    return qty.toLocaleString("en-US", { maximumFractionDigits: decimals });
  }, [qty, decimals]);

  function toggleMode() {
    if (amountValue > 0) {
      setAmountInput(
        inputMode === "usd"
          ? (notional / entryPrice).toFixed(decimals)
          : notional.toFixed(2),
      );
    }
    setInputMode((m) => (m === "usd" ? "base" : "usd"));
  }

  function useMax() {
    const maxNotional = WALLET_BALANCE * leverage * (1 - TAKER_FEE_RATE);
    setAmountInput(inputMode === "usd" ? maxNotional.toFixed(2) : (maxNotional / entryPrice).toFixed(decimals));
  }

  async function submit() {
    if (!canSubmit) return;
    setSubmitError(null);

    if (realOrdersAvailable && session && orderlyInstrument) {
      setSubmitting(true);
      try {
        await submitOrder(session.sessionKey, session.accountId, {
          symbol: orderlyInstrument,
          order_type: orderType === "market" ? "MARKET" : "LIMIT",
          side: side === "long" ? "BUY" : "SELL",
          order_quantity: qty,
          order_price: orderType === "market" ? undefined : entryPrice,
        });
        setConfirmation(
          `${side === "long" ? "Long" : "Short"} ${asset.display} order sent to Aark/Orderly.`,
        );
        setAmountInput("");
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : String(e));
      } finally {
        setSubmitting(false);
      }
      window.setTimeout(() => setConfirmation(null), 4000);
      return;
    }

    setConfirmation(
      `${side === "long" ? "Long" : "Short"} ${asset.display} opened at ${formatPrice(entryPrice, asset.decimals)}`,
    );
    setAmountInput("");
    window.setTimeout(() => setConfirmation(null), 3200);
  }

  return (
    <div className="px-5 pb-6">
      <LongShortToggle value={side} onChange={setSide} />

      <div className="mt-3">
        <SegmentedControl options={ORDER_TYPE_OPTIONS} value={orderType} onChange={setOrderType} />
      </div>

      {orderType !== "market" && (
        <div className="mt-3">
          <div className="mb-1.5 text-xs text-muted-2">{orderType === "limit" ? "Limit price" : "Stop price"}</div>
          <div className="flex items-center rounded-xl border border-border-subtle bg-surface-2 px-3.5">
            <span className="text-muted-2">$</span>
            <input
              value={limitPriceInput}
              onChange={(e) => setLimitPriceInput(e.target.value)}
              inputMode="decimal"
              placeholder={asset.price.toFixed(asset.decimals)}
              className="w-full bg-transparent py-3 pl-1.5 font-mono text-base tabular-nums outline-none"
            />
          </div>
        </div>
      )}

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-muted-2">Amount</span>
          <span className="text-xs text-muted-2">Available {formatUsd(WALLET_BALANCE)}</span>
        </div>
        <div className="flex items-center rounded-xl border border-border-subtle bg-surface-2 pl-3.5 pr-1.5">
          <input
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            className="w-full bg-transparent py-3.5 font-mono text-lg tabular-nums outline-none placeholder:text-muted-2"
          />
          <button
            onClick={toggleMode}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-surface-3 px-2.5 py-2 text-xs font-semibold"
          >
            {inputMode === "usd" ? "USD" : asset.symbol}
            <ArrowLeftRight size={11} className="text-muted-2" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <button onClick={useMax} className="text-[11px] font-semibold text-long">
            Use max
          </button>
          <span className="font-mono text-[11px] tabular-nums text-muted-2">
            ≈ {inputMode === "usd" ? `${formattedQty} ${asset.symbol}` : formatUsd(notional)}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <LeverageSlider value={leverage} max={asset.maxLeverage} onChange={setLeverage} />
      </div>

      <div className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug" style={{ color }}>
        <TriangleAlert size={13} className="mt-0.5 shrink-0" />
        <span>
          A {liqMovePct.toFixed(liqMovePct < 1 ? 2 : 1)}% adverse move liquidates this position.
        </span>
      </div>

      <div className="mt-5 space-y-2.5 border-t border-border-subtle pt-4">
        <Row label="Required margin" value={formatUsd(margin)} />
        <Row label="Est. fee" value={formatUsd(fee)} />
        <div className="my-1 h-px bg-border-subtle" />
        <Row label="Order value" value={formatUsd(notional)} strong />
        <Row label="Estimated cost" value={formatUsd(estimatedCost)} strong />
        <Row
          label="Liquidation price"
          value={notional > 0 ? formatPrice(liqPrice, asset.decimals) : "—"}
          tone={side === "long" ? "short" : "long"}
          strong
        />
      </div>

      {insufficientBalance && (
        <div className="mt-3 rounded-lg bg-short-dim px-3 py-2 text-xs font-medium text-short">
          Estimated cost exceeds your available balance.
        </div>
      )}

      {submitError && (
        <div className="mt-3 rounded-lg bg-short-dim px-3 py-2 text-xs font-medium text-short">
          Order failed: {submitError}
        </div>
      )}

      {confirmation && (
        <div className="mt-3 rounded-lg bg-long-dim px-3 py-2 text-xs font-medium text-long">
          {confirmation} {realOrdersAvailable ? "· Real Orderly API call." : "· Demo order, not sent to a real venue."}
        </div>
      )}

      <Button
        variant={side}
        size="lg"
        className="mt-5 w-full"
        disabled={!canSubmit || submitting}
        onClick={submit}
      >
        {submitting ? "Submitting..." : `${side === "long" ? "Open Long" : "Open Short"} · ${asset.display}`}
      </Button>
      {connection.status === "connected" && (
        <p className="mt-2 text-center text-[11px] text-muted-2">
          {realOrdersAvailable
            ? `Real: signs and sends a live order to Orderly for ${orderlyInstrument}.`
            : session
              ? "Session authorized, but this instrument isn't mapped to a real Orderly market — stays simulated."
              : "Wallet connected — set up an Aark session key on the Account page to enable real orders."}
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "long" | "short";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-2">{label}</span>
      <span
        className={cn(
          "font-mono text-xs tabular-nums",
          strong ? "text-sm font-semibold" : "font-medium",
          tone === "long" && "text-long",
          tone === "short" && "text-short",
          !tone && "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
