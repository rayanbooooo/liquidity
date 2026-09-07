# liquid.trade

A mobile-first perpetuals trading terminal — crypto, forex, and commodities
with leverage up to 1000x. Absolute dark mode, tabular-numeral pricing,
copy trading. Prices, positions, and the portfolio balance shown
throughout are deterministic mock data — but crypto order submission and
deposits can run for real against Aark Digital's actual Orderly Network
backend once a session key is set up; see "Aark Digital integration
status" below.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · `lightweight-charts`
for the candlestick/line terminal chart · hand-built UI primitives (no
component library) · `lucide-react` icons · `wagmi`/`viem` for wallet
connection on Arbitrum One.

## Aark Digital integration status

Aark Digital doesn't run its own trading backend — it's a white-label
front-end over [Orderly Network](https://orderly.network)'s shared
omnichain orderbook (a real, publicly-partnered, publicly-documented
protocol — unlike Aark's own docs, which this environment couldn't reach
at all). Everything below was built against Orderly's actual public
docs/SDKs/contract source, cross-checked across multiple independent
sources — see the doc comments in `src/lib/aark/` for exactly what's
confirmed vs. still assumed at each step.

**Real, end to end:**
- Wallet connection (`src/lib/wagmi-config.ts`, `Providers`,
  `ConnectWalletButton`) on Arbitrum One, wrong-network prompt included.
- Registration (`registerAccount`) — signs Orderly's actual `Registration`
  EIP-712 message with the connected wallet.
- **Session keys** (`generateSessionKey` + `authorizeSessionKey` — the
  "EIP-712 session key framework and delegate authorization" from the
  original ask): a local ed25519 keypair generated client-side, then
  wallet-signed via Orderly's real `AddOrderlyKey` EIP-712 message. Once
  authorized, orders sign with the session key, no wallet popup per trade.
  Persisted per-wallet in localStorage (`session-store.ts`, via
  `useSyncExternalStore` so every component reacts live when a session is
  created or cleared, no reload needed) and surfaced in a real UI flow on
  the Account page (`AarkSessionSetup`).
- **Order submission** (`signOrderlyRequest` + `submitOrder`) — ed25519
  request signing over Orderly's documented
  `{timestamp}{method}{path}{body}` scheme. Wired straight into the Trade
  Ticket's Open Long/Short button: with an authorized session and a
  symbol that maps to a real Orderly instrument (crypto only —
  `ORDERLY_INSTRUMENT_BY_SYMBOL` in `orderly-config.ts`; forex/commodities
  aren't real Orderly markets and stay simulated), it sends a real signed
  order instead of the demo flow.
- **Deposits** (`buildDepositCalldata`, `DepositFlow` on the Account page)
  — reconstructed from confirmed facts (Vault.sol's real
  `deposit(VaultDepositFE)` signature, the real `AccountDeposit`/
  `AccountWithdraw` event field types, and Orderly's documented
  `accountId = f(wallet, brokerId)` rule), not guessed from nothing. Lower
  confidence than everything above it — the exact struct *field order*
  isn't independently confirmed — so it's not a blind one-click send: it
  shows the decoded accountId/brokerHash/tokenHash/amount for review
  before broadcasting anything, with that caveat stated in the UI itself.
  Full derivation reasoning is in the doc comment above
  `buildDepositCalldata` in `orderly-client.ts`.

**One required config value, not fabricated:** `NEXT_PUBLIC_AARK_BROKER_ID`
— every Orderly broker has its own id, and Aark's isn't publicly listed
anywhere this environment could reach. Get it from Aark's own app (network
tab) or Orderly's broker lookup endpoint, then set it in `.env.local`.
`AarkSessionSetup` on the Account page explains this inline if it's unset,
and nothing above will run without it.

The portfolio balance shown throughout the app stays simulated mock data
regardless — it's not read from the real Orderly account.

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
- `src/components/wallet/` — `ConnectWalletButton` (wagmi wallet
  connection), `AarkSessionSetup` (registration + session-key
  authorization), `BalanceCard` + `DepositFlow` (the real, review-before-
  send deposit flow on the Account page).
- `src/lib/aark/` — the Orderly Network integration: `orderly-config.ts`
  (endpoints/domain/addresses/instrument mapping, each comment-flagged
  with how confident it is), `orderly-types.ts` (EIP-712 struct + request
  shapes), `orderly-client.ts` (the actual signing/request/deposit-
  encoding logic), and `session-store.ts` (the localStorage-backed,
  `useSyncExternalStore`-driven session shared across components) — see
  "Aark Digital integration status" above for what's real vs. reconstructed.
- `src/app/*` — Home, Markets, `/trade/[ticker]`, Discover +
  `/discover/[trader]`, Account.

## Other commands

```bash
npm run lint         # ESLint
npx tsc --noEmit      # type-check
npm run build         # production build (fully statically generated)
```
