import { freeWalk, generateCandles, generateSparkline, seriesChange, unrealizedPnl } from "./calc";
import type { Asset, ActivityItem, Position, Timeframe, Trader } from "./types";

function asset(input: {
  symbol: string;
  display: string;
  name: string;
  assetClass: Asset["assetClass"];
  price: number;
  changePct24h: number;
  volume24h: number;
  maxLeverage: number;
  decimals: number;
}): Asset {
  const volFactor = input.assetClass === "crypto" ? 0.045 : input.assetClass === "forex" ? 0.006 : 0.02;
  const startPrice = input.price / (1 + input.changePct24h / 100);
  return {
    ...input,
    changeAbs24h: input.price * (input.changePct24h / 100),
    sparkline: generateSparkline(input.symbol, 24, startPrice, input.price, input.price * volFactor),
  };
}

export const ASSETS: Asset[] = [
  asset({
    symbol: "BTC",
    display: "BTC",
    name: "Bitcoin",
    assetClass: "crypto",
    price: 68432.17,
    changePct24h: 3.86,
    volume24h: 41_200_000_000,
    maxLeverage: 150,
    decimals: 2,
  }),
  asset({
    symbol: "ETH",
    display: "ETH",
    name: "Ethereum",
    assetClass: "crypto",
    price: 3482.76,
    changePct24h: 2.95,
    volume24h: 18_600_000_000,
    maxLeverage: 150,
    decimals: 2,
  }),
  asset({
    symbol: "SOL",
    display: "SOL",
    name: "Solana",
    assetClass: "crypto",
    price: 147.5,
    changePct24h: -5.83,
    volume24h: 3_400_000_000,
    maxLeverage: 100,
    decimals: 2,
  }),
  asset({
    symbol: "XRP",
    display: "XRP",
    name: "XRP",
    assetClass: "crypto",
    price: 0.6218,
    changePct24h: 1.42,
    volume24h: 1_850_000_000,
    maxLeverage: 75,
    decimals: 4,
  }),
  asset({
    symbol: "DOGE",
    display: "DOGE",
    name: "Dogecoin",
    assetClass: "crypto",
    price: 0.1734,
    changePct24h: -2.1,
    volume24h: 920_000_000,
    maxLeverage: 75,
    decimals: 4,
  }),
  asset({
    symbol: "AVAX",
    display: "AVAX",
    name: "Avalanche",
    assetClass: "crypto",
    price: 38.92,
    changePct24h: 4.1,
    volume24h: 640_000_000,
    maxLeverage: 100,
    decimals: 2,
  }),
  asset({
    symbol: "EURUSD",
    display: "EUR/USD",
    name: "Euro / US Dollar",
    assetClass: "forex",
    price: 1.0834,
    changePct24h: 0.21,
    volume24h: 92_000_000_000,
    maxLeverage: 1000,
    decimals: 4,
  }),
  asset({
    symbol: "GBPUSD",
    display: "GBP/USD",
    name: "British Pound / US Dollar",
    assetClass: "forex",
    price: 1.2687,
    changePct24h: -0.15,
    volume24h: 54_000_000_000,
    maxLeverage: 1000,
    decimals: 4,
  }),
  asset({
    symbol: "USDJPY",
    display: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    assetClass: "forex",
    price: 149.82,
    changePct24h: 0.34,
    volume24h: 61_000_000_000,
    maxLeverage: 1000,
    decimals: 2,
  }),
  asset({
    symbol: "AUDUSD",
    display: "AUD/USD",
    name: "Australian Dollar / US Dollar",
    assetClass: "forex",
    price: 0.6542,
    changePct24h: -0.42,
    volume24h: 28_000_000_000,
    maxLeverage: 1000,
    decimals: 4,
  }),
  asset({
    symbol: "USDCHF",
    display: "USD/CHF",
    name: "US Dollar / Swiss Franc",
    assetClass: "forex",
    price: 0.8812,
    changePct24h: 0.08,
    volume24h: 19_000_000_000,
    maxLeverage: 1000,
    decimals: 4,
  }),
  asset({
    symbol: "XAUUSD",
    display: "XAU/USD",
    name: "Gold",
    assetClass: "commodity",
    price: 2412.5,
    changePct24h: 0.62,
    volume24h: 34_000_000_000,
    maxLeverage: 500,
    decimals: 2,
  }),
  asset({
    symbol: "XAGUSD",
    display: "XAG/USD",
    name: "Silver",
    assetClass: "commodity",
    price: 28.94,
    changePct24h: 1.15,
    volume24h: 6_200_000_000,
    maxLeverage: 500,
    decimals: 3,
  }),
  asset({
    symbol: "WTI",
    display: "WTI",
    name: "Crude Oil (WTI)",
    assetClass: "commodity",
    price: 78.32,
    changePct24h: -1.08,
    volume24h: 21_000_000_000,
    maxLeverage: 300,
    decimals: 2,
  }),
  asset({
    symbol: "NATGAS",
    display: "NATGAS",
    name: "Natural Gas",
    assetClass: "commodity",
    price: 2.847,
    changePct24h: 2.34,
    volume24h: 8_400_000_000,
    maxLeverage: 300,
    decimals: 3,
  }),
];

export function getAsset(symbol: string): Asset | undefined {
  return ASSETS.find((a) => a.symbol.toLowerCase() === symbol.toLowerCase());
}

export const POSITIONS: Position[] = [
  {
    id: "pos-btc",
    symbol: "BTC",
    name: "Bitcoin",
    assetClass: "crypto",
    side: "long",
    leverage: 10,
    margin: 2000,
    entryPrice: 64200,
    decimals: 2,
    openedAt: "2026-09-04T09:12:00Z",
  },
  {
    id: "pos-eth",
    symbol: "ETH",
    name: "Ethereum",
    assetClass: "crypto",
    side: "short",
    leverage: 15,
    margin: 800,
    entryPrice: 3600,
    decimals: 2,
    openedAt: "2026-09-05T21:47:00Z",
  },
  {
    id: "pos-sol",
    symbol: "SOL",
    name: "Solana",
    assetClass: "crypto",
    side: "long",
    leverage: 50,
    margin: 300,
    entryPrice: 150.0,
    decimals: 2,
    openedAt: "2026-09-07T06:30:00Z",
  },
  {
    id: "pos-xau",
    symbol: "XAUUSD",
    name: "Gold",
    assetClass: "commodity",
    side: "short",
    leverage: 20,
    margin: 500,
    entryPrice: 2395.0,
    decimals: 2,
    openedAt: "2026-09-03T14:05:00Z",
  },
  {
    id: "pos-eurusd",
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    assetClass: "forex",
    side: "long",
    leverage: 5,
    margin: 1000,
    entryPrice: 1.079,
    decimals: 4,
    openedAt: "2026-09-02T11:00:00Z",
  },
];

export const WALLET_BALANCE = 18_942.1;

const MARGIN_USED = POSITIONS.reduce((sum, p) => sum + p.margin, 0);
const TOTAL_UNREALIZED_PNL = POSITIONS.reduce((sum, p) => {
  const a = getAsset(p.symbol);
  if (!a) return sum;
  return sum + unrealizedPnl(p.entryPrice, a.price, p.margin, p.leverage, p.side);
}, 0);

export const MARGIN_SUMMARY = {
  walletBalance: WALLET_BALANCE,
  marginUsed: MARGIN_USED,
  unrealizedPnl: TOTAL_UNREALIZED_PNL,
  totalEquity: WALLET_BALANCE + MARGIN_USED + TOTAL_UNREALIZED_PNL,
};

const PORTFOLIO_INTRADAY = freeWalk(
  "portfolio-1d",
  48,
  MARGIN_SUMMARY.totalEquity,
  MARGIN_SUMMARY.totalEquity * 0.008,
);
const PORTFOLIO_DAILY = freeWalk(
  "portfolio-all",
  365,
  MARGIN_SUMMARY.totalEquity,
  MARGIN_SUMMARY.totalEquity * 0.05,
);

export const PORTFOLIO_SERIES: Record<Timeframe, number[]> = {
  "1D": PORTFOLIO_INTRADAY,
  "1W": PORTFOLIO_DAILY.slice(-7),
  "1M": PORTFOLIO_DAILY.slice(-30),
  "3M": PORTFOLIO_DAILY.slice(-90),
  "1Y": PORTFOLIO_DAILY,
  ALL: PORTFOLIO_DAILY,
};

export const TODAY_PNL = seriesChange(PORTFOLIO_INTRADAY);

export const TRADERS: Trader[] = [
  {
    id: "nova-macro",
    handle: "NovaMacro",
    initials: "NM",
    accentFrom: "#6366f1",
    accentTo: "#22d3ee",
    verified: true,
    tags: ["Macro", "Forex", "Swing"],
    followers: 18400,
    ytdReturnPct: 142.6,
    winRate: 68,
    riskScore: 2,
    totalTrades: 812,
    monthlyFeeUsd: 9.99,
    bio: "Discretionary macro swings across FX majors and gold. Holds 3-10 days, sizes down into central bank weeks.",
    performance: generateSparkline("nova-macro", 30, 100, 242.6, 14),
    topSymbols: ["EURUSD", "XAUUSD", "GBPUSD"],
  },
  {
    id: "degen-vega",
    handle: "DegenVega",
    initials: "DV",
    accentFrom: "#f97316",
    accentTo: "#ef4444",
    verified: true,
    tags: ["Crypto", "High Leverage", "Scalp"],
    followers: 32100,
    ytdReturnPct: 486.3,
    winRate: 54,
    riskScore: 3,
    totalTrades: 5400,
    monthlyFeeUsd: 14.99,
    bio: "High-leverage BTC/ETH scalps, 50-200x, tight stops, high frequency. Not for the faint of heart.",
    performance: generateSparkline("degen-vega", 30, 100, 586.3, 60),
    topSymbols: ["BTC", "ETH", "SOL"],
  },
  {
    id: "quiet-carry",
    handle: "QuietCarry",
    initials: "QC",
    accentFrom: "#14b8a6",
    accentTo: "#84cc16",
    verified: false,
    tags: ["Forex", "Low Leverage", "Conservative"],
    followers: 6250,
    ytdReturnPct: 24.8,
    winRate: 77,
    riskScore: 1,
    totalTrades: 210,
    monthlyFeeUsd: 4.99,
    bio: "Low-leverage carry and mean-reversion on majors. Capital preservation first, upside second.",
    performance: generateSparkline("quiet-carry", 30, 100, 124.8, 3),
    topSymbols: ["USDCHF", "AUDUSD", "EURUSD"],
  },
  {
    id: "commodity-hawk",
    handle: "CommodityHawk",
    initials: "CH",
    accentFrom: "#eab308",
    accentTo: "#f97316",
    verified: true,
    tags: ["Commodities", "Momentum"],
    followers: 11800,
    ytdReturnPct: 89.2,
    winRate: 61,
    riskScore: 2,
    totalTrades: 640,
    monthlyFeeUsd: 9.99,
    bio: "Momentum breakouts on gold, oil and nat gas positioned around macro catalysts and inventory prints.",
    performance: generateSparkline("commodity-hawk", 30, 100, 189.2, 11),
    topSymbols: ["XAUUSD", "WTI", "NATGAS"],
  },
  {
    id: "riftmanager",
    handle: "RiftManager",
    initials: "RM",
    accentFrom: "#8b5cf6",
    accentTo: "#ec4899",
    verified: true,
    tags: ["Crypto", "Altcoins", "Swing"],
    followers: 5600,
    ytdReturnPct: 156.4,
    winRate: 59,
    riskScore: 2,
    totalTrades: 980,
    monthlyFeeUsd: 7.99,
    bio: "Altcoin swing trades sized through a systematic risk model, typically 5-25x.",
    performance: generateSparkline("riftmanager", 30, 100, 256.4, 18),
    topSymbols: ["SOL", "AVAX", "XRP"],
  },
  {
    id: "cryptowolf",
    handle: "CryptoWolf",
    initials: "CW",
    accentFrom: "#64748b",
    accentTo: "#334155",
    verified: false,
    tags: ["Crypto", "Extreme Leverage"],
    followers: 18900,
    ytdReturnPct: -32.1,
    winRate: 41,
    riskScore: 3,
    totalTrades: 3100,
    monthlyFeeUsd: 12.99,
    bio: "Full-send directional bets at 200x+. High variance — size your allocation accordingly.",
    performance: generateSparkline("cryptowolf", 30, 100, 67.9, 45),
    topSymbols: ["BTC", "DOGE", "SOL"],
  },
];

export const ACTIVITY: ActivityItem[] = [
  {
    id: "act-1",
    kind: "order",
    symbol: "BTC",
    side: "long",
    title: "Opened Long · BTC",
    detail: "10x · Market order",
    amount: 2000,
    status: "filled",
    timestamp: "2026-09-04T09:12:00Z",
  },
  {
    id: "act-2",
    kind: "deposit",
    title: "Deposit",
    detail: "Bank transfer",
    amount: 5000,
    status: "completed",
    timestamp: "2026-09-03T08:00:00Z",
  },
  {
    id: "act-3",
    kind: "order",
    symbol: "ETH",
    side: "short",
    title: "Opened Short · ETH",
    detail: "15x · Limit order",
    amount: 800,
    status: "filled",
    timestamp: "2026-09-05T21:47:00Z",
  },
  {
    id: "act-4",
    kind: "funding",
    symbol: "BTC",
    title: "Funding payment · BTC",
    detail: "8h funding · 0.0031%",
    amount: -12.4,
    status: "completed",
    timestamp: "2026-09-06T16:00:00Z",
  },
  {
    id: "act-5",
    kind: "liquidation",
    symbol: "DOGE",
    side: "long",
    title: "Liquidated · DOGE",
    detail: "300x · Long wiped on a 0.3% move",
    amount: -420,
    status: "filled",
    timestamp: "2026-08-29T03:22:00Z",
  },
  {
    id: "act-6",
    kind: "withdrawal",
    title: "Withdrawal",
    detail: "Bank transfer",
    amount: -500,
    status: "completed",
    timestamp: "2026-08-27T12:30:00Z",
  },
  {
    id: "act-7",
    kind: "order",
    symbol: "XAUUSD",
    side: "short",
    title: "Opened Short · Gold",
    detail: "20x · Market order",
    amount: 500,
    status: "filled",
    timestamp: "2026-09-03T14:05:00Z",
  },
];

export const ORDER_TYPES = ["market", "limit", "stop"] as const;

export const LEVERAGE_PRESETS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];

export const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

const CHART_RANGES = {
  "15m": { count: 96, intervalSeconds: 900 },
  "1H": { count: 120, intervalSeconds: 3600 },
  "4H": { count: 120, intervalSeconds: 14400 },
  "1D": { count: 180, intervalSeconds: 86400 },
} as const;

export type ChartRange = keyof typeof CHART_RANGES;
export const CHART_RANGE_KEYS = Object.keys(CHART_RANGES) as ChartRange[];

export function getCandleSeries(symbol: string, range: ChartRange = "1H") {
  const a = getAsset(symbol);
  if (!a) return [];
  const volFactor = a.assetClass === "crypto" ? 0.05 : a.assetClass === "forex" ? 0.007 : 0.022;
  const { count, intervalSeconds } = CHART_RANGES[range];
  return generateCandles(`${symbol}-${range}`, count, a.price, a.price * volFactor, intervalSeconds);
}
