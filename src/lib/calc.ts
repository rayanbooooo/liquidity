import type { Side } from "./types";

/**
 * Simplified isolated-margin liquidation price: the price move that exactly
 * consumes 100% of posted margin. Buffer shrinks as 1/leverage, so it never
 * inverts past entry the way a fixed maintenance-margin offset can at very
 * high leverage.
 */
export function liquidationPrice(entryPrice: number, leverage: number, side: Side): number {
  const buffer = 1 / leverage;
  return side === "long" ? entryPrice * (1 - buffer) : entryPrice * (1 + buffer);
}

export function notionalValue(margin: number, leverage: number): number {
  return margin * leverage;
}

export function positionQty(margin: number, leverage: number, entryPrice: number): number {
  return notionalValue(margin, leverage) / entryPrice;
}

export function unrealizedPnl(
  entryPrice: number,
  markPrice: number,
  margin: number,
  leverage: number,
  side: Side,
): number {
  const qty = positionQty(margin, leverage, entryPrice);
  const delta = side === "long" ? markPrice - entryPrice : entryPrice - markPrice;
  return delta * qty;
}

export function unrealizedPnlPct(
  entryPrice: number,
  markPrice: number,
  leverage: number,
  side: Side,
): number {
  const delta = side === "long" ? markPrice - entryPrice : entryPrice - markPrice;
  return (delta / entryPrice) * leverage * 100;
}

/**
 * Risk tier based on how much of the position's *original* liquidation
 * buffer (1/leverage at entry) has been eaten by price movement so far,
 * rather than a flat distance-to-liquidation percentage — the latter makes
 * every high-leverage position look equally "dangerous" even seconds after
 * opening. A 1000x scalp with 0.1% headroom left is only alarming once
 * price has actually moved against it.
 */
export function positionRiskTier(
  entryPrice: number,
  markPrice: number,
  leverage: number,
  side: Side,
): RiskTierResult {
  const liq = liquidationPrice(entryPrice, leverage, side);
  const currentDistancePct = (Math.abs(markPrice - liq) / markPrice) * 100;
  const initialDistancePct = (1 / leverage) * 100;
  const burn = Math.max(0, Math.min(1, 1 - currentDistancePct / initialDistancePct));

  const tier = burn > 0.75 ? "danger" : burn > 0.4 ? "caution" : "safe";
  return { tier, burn, liquidationPrice: liq, distancePct: currentDistancePct };
}

export interface RiskTierResult {
  tier: "safe" | "caution" | "danger";
  burn: number;
  liquidationPrice: number;
  distancePct: number;
}

// ---- Deterministic pseudo-random helpers (SSR/CSR must agree — no Math.random) ----

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 3-tap moving average, endpoints held fixed, so a sparkline reads as a trend, not tick noise. */
function smoothSeries(values: number[], passes: number): number[] {
  let result = values;
  for (let p = 0; p < passes; p++) {
    result = result.map((v, i, arr) => {
      if (i === 0 || i === arr.length - 1) return v;
      return (arr[i - 1] + v + arr[i + 1]) / 3;
    });
  }
  return result;
}

/** Deterministic random walk, seeded by `seed`, ending exactly at `endValue`. Start is unconstrained. */
export function freeWalk(seed: string, points: number, endValue: number, volatility: number): number[] {
  const rand = mulberry32(hashSeed(seed));
  const steps: number[] = [0];
  for (let i = 1; i < points; i++) {
    const drift = (rand() - 0.5) * volatility;
    steps.push(steps[i - 1] + drift);
  }
  const lastOffset = steps[steps.length - 1];
  const walk = steps.map((s) => endValue - lastOffset + s);
  return smoothSeries(walk, 3);
}

/**
 * Deterministic random walk seeded by `seed`, pinned at *both* ends (a
 * Brownian bridge) so the series starts exactly at `startValue` and ends
 * exactly at `endValue`. Use this whenever the chart sits next to a change
 * badge derived from those same two numbers — an end-only anchored walk's
 * apparent trend has no relation to the stated change and can point the
 * wrong way half the time.
 */
export function generateSparkline(
  seed: string,
  points: number,
  startValue: number,
  endValue: number,
  volatility: number,
): number[] {
  const rand = mulberry32(hashSeed(seed));
  const noise: number[] = [0];
  for (let i = 1; i < points; i++) {
    noise.push(noise[i - 1] + (rand() - 0.5) * volatility);
  }
  const n = points - 1;
  const lastNoise = noise[n];
  const walk = noise.map((v, i) => {
    const bridged = v - lastNoise * (i / n);
    const trend = startValue + (endValue - startValue) * (i / n);
    return trend + bridged;
  });
  return smoothSeries(walk, 3);
}

export function generateCandles(
  seed: string,
  count: number,
  endValue: number,
  volatility: number,
  intervalSeconds: number,
): { time: number; open: number; high: number; low: number; close: number }[] {
  const rand = mulberry32(hashSeed(seed));
  const closes = freeWalk(seed, count, endValue, volatility);
  const now = 1_757_260_800; // fixed anchor (2025-09-07T12:00:00Z) so SSR/CSR match
  const startTime = now - (count - 1) * intervalSeconds;

  return closes.map((close, i) => {
    const open = i === 0 ? close - (rand() - 0.5) * volatility * 0.5 : closes[i - 1];
    const wick = Math.abs(volatility) * (0.3 + rand() * 0.5);
    const high = Math.max(open, close) + wick * rand();
    const low = Math.min(open, close) - wick * rand();
    return { time: startTime + i * intervalSeconds, open, high, low, close };
  });
}

// ---- Formatting ----

export function formatUsd(value: number, decimals = 2): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatPrice(value: number, decimals: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}

export function formatPct(value: number, decimals = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatSigned(value: number, decimals = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatUsd(value, decimals)}`;
}

export function seriesChange(series: number[]): { abs: number; pct: number } {
  const first = series[0];
  const last = series[series.length - 1];
  const abs = last - first;
  const pct = first === 0 ? 0 : (abs / first) * 100;
  return { abs, pct };
}
