# liquid.trade

A mobile-first perpetuals trading terminal — crypto, forex, and commodities
with leverage up to 1000x. Absolute dark mode, tabular-numeral pricing,
copy trading. Everything runs on deterministic mock data; there is no
backend or real order execution yet.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · `lightweight-charts`
for the candlestick/line terminal chart · hand-built UI primitives (no
component library) · `lucide-react` icons.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The layout is
mobile-first: on a phone it's edge-to-edge, on a wider screen it centers in
a fixed-width device frame.

## Structure

- `src/lib/types.ts` — domain types (`Asset`, `Position`, `Trader`, ...).
- `src/lib/calc.ts` — all the math: liquidation price, unrealized PnL, the
  per-position risk tier, and the deterministic pseudo-random generators
  used for sparklines/candles (seeded, so server and client render the same
  data — no hydration mismatches).
- `src/lib/mock-data.ts` — the fifteen tradable assets (crypto/forex/
  commodities), five open positions, six copy-traders, and portfolio-level
  numbers. These are computed from each other where it matters (e.g. total
  equity is derived from wallet balance + live position PnL, not a separate
  hardcoded figure), so the UI stays internally consistent as you interact
  with it.
- `src/components/shell/` — `AppFrame` (the mobile viewport wrapper) and
  the fixed 5-tab `BottomNav`.
- `src/components/trade/` — `PriceChart` (the `lightweight-charts`
  wrapper), `OrderTicket`, and `LeverageSlider`.
- `src/app/*` — Home, Markets, `/trade/[ticker]`, Discover +
  `/discover/[trader]`, Account.

## Other commands

```bash
npm run lint         # ESLint
npx tsc --noEmit      # type-check
npm run build         # production build (fully statically generated)
```
