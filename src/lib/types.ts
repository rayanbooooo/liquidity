export type AssetClass = "crypto" | "forex" | "commodity";

export type Side = "long" | "short";

export type OrderType = "market" | "limit" | "stop";

export type RiskTier = "safe" | "caution" | "danger";

export type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

export interface Asset {
  symbol: string;
  display: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  changePct24h: number;
  changeAbs24h: number;
  volume24h: number;
  maxLeverage: number;
  sparkline: number[];
  decimals: number;
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  side: Side;
  leverage: number;
  margin: number;
  entryPrice: number;
  decimals: number;
  openedAt: string;
}

export interface Trader {
  id: string;
  handle: string;
  initials: string;
  accentFrom: string;
  accentTo: string;
  verified: boolean;
  tags: string[];
  followers: number;
  ytdReturnPct: number;
  winRate: number;
  riskScore: 1 | 2 | 3;
  totalTrades: number;
  monthlyFeeUsd: number;
  bio: string;
  performance: number[];
  topSymbols: string[];
}

export interface ActivityItem {
  id: string;
  kind: "order" | "deposit" | "withdrawal" | "funding" | "liquidation";
  symbol?: string;
  side?: Side;
  title: string;
  detail: string;
  amount: number;
  status: "filled" | "pending" | "completed" | "cancelled";
  timestamp: string;
}
