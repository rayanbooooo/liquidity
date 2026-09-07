# liquid.trade

A mobile-first perpetuals trading terminal — crypto, forex, and commodities
with leverage up to 1000x. Absolute dark mode, tabular-numeral pricing,
copy trading. Everything runs on deterministic mock data; there is no
backend or real order execution yet.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · `lightweight-charts`
for the candlestick/line terminal chart · hand-built UI primitives (no
component library) · `lucide-react` icons · `wagmi`/`viem` for wallet
connection on Arbitrum One.

## Aark Digital integration status

The intent is to execute real trades through [Aark
Digital](https://aark.digital) (a perpetual DEX on Arbitrum One) via a
session-key delegate-authorization flow. **What's real right now:**

- Wallet connection (`src/lib/wagmi-config.ts`, `Providers`,
  `ConnectWalletButton`) — connecting a browser wallet (MetaMask etc.) on
  Arbitrum One actually works, including a wrong-network prompt.

**What's deliberately stubbed:** everything in `src/lib/aark/client.ts` —
`requestSessionKeyAuthorization`, `depositMargin`, `submitOrder` — throws
an `AarkNotConfiguredError` instead of running. Aark doesn't publish a
public SDK or contract ABI, and their docs weren't reachable while this was
built, so there was no verified source for the EIP-712 domain/type
definitions, contract addresses, or gasless-deposit mechanism those
functions need. Guessing at those specifics is exactly how a leveraged
trading integration loses real user funds, so each stub documents precisely
what it's missing in its doc comment rather than faking a plausible
implementation. The Trade Ticket and Account balance stay on simulated
mock data throughout — see the in-app notes next to Connect Wallet and the
order submit button.

**To finish this:** get Aark's actual integration docs/SDK (this is very
likely a partner/institutional integration, not self-serve, given the
session-key framing) and fill in `src/lib/aark/client.ts` against the real
contract addresses and EIP-712 types. `src/lib/aark/types.ts` has the
provisional request/response shapes to reconcile against whatever Aark
actually specifies.

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
- `src/components/wallet/ConnectWalletButton.tsx` — real wagmi wallet
  connection (Arbitrum One).
- `src/lib/aark/` — the Aark Digital integration boundary. `types.ts` is
  provisional shapes, `client.ts` is stubs that throw until it's wired up
  for real — see "Aark Digital integration status" above.
- `src/app/*` — Home, Markets, `/trade/[ticker]`, Discover +
  `/discover/[trader]`, Account.

## Other commands

```bash
npm run lint         # ESLint
npx tsc --noEmit      # type-check
npm run build         # production build (fully statically generated)
```
