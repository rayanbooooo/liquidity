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

Aark Digital doesn't run its own trading backend — it's a white-label
front-end over [Orderly Network](https://orderly.network)'s shared
omnichain orderbook (a real, publicly-partnered, publicly-documented
protocol — unlike Aark's own docs, which this environment couldn't reach
at all). Everything below was built against Orderly's actual public
docs/SDKs/contract source, cross-checked across multiple independent
sources — see the doc comments in `src/lib/aark/` for exactly what's
confirmed vs. still assumed at each step.

**Real:**
- Wallet connection (`src/lib/wagmi-config.ts`, `Providers`,
  `ConnectWalletButton`) on Arbitrum One, wrong-network prompt included.
- Registration (`registerAccount`) — signs Orderly's actual `Registration`
  EIP-712 message with the connected wallet.
- **Session keys** (`generateSessionKey` + `authorizeSessionKey` — this is
  the "EIP-712 session key framework and delegate authorization" from the
  original ask): generates a local ed25519 keypair client-side, then
  wallet-signs Orderly's `AddOrderlyKey` EIP-712 message authorizing it —
  after that, orders sign with the session key, no wallet popup per trade.
  Wired into a real UI flow on the Account page (`AarkSessionSetup`).
- Per-order request signing (`signOrderlyRequest`, `submitOrder`) — ed25519
  over Orderly's documented `{timestamp}{method}{path}{body}` scheme.
- USDC's real contract address on Arbitrum One, and the ERC-20 `approve`
  call needed before any deposit (`encodeUsdcApproval`).

**Still a stub, on purpose:** `depositMargin()`. Orderly's Vault contract
(source found on GitHub) takes a `VaultDepositFE` struct, but this
environment couldn't confirm its exact field order/types, nor how
`accountId`/`brokerHash` are derived. A malformed EIP-712 signature just
fails to verify; a malformed deposit struct can silently misdirect funds —
so this one stays unimplemented rather than guessed. See the doc comment
on `depositMargin` in `orderly-client.ts`.

**One required config value, not fabricated:** `NEXT_PUBLIC_AARK_BROKER_ID`
— every Orderly broker has its own id, and Aark's isn't publicly listed
anywhere this environment could reach. Get it from Aark's own app (network
tab) or Orderly's broker lookup endpoint, then set it in `.env.local`.
`AarkSessionSetup` on the Account page explains this inline if it's unset.

The Trade Ticket and Account balance are still simulated throughout —
registering/authorizing a session key doesn't deposit anything or place
any order.

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
- `src/components/wallet/` — `ConnectWalletButton` (real wagmi wallet
  connection) and `AarkSessionSetup` (real registration + session-key
  authorization flow).
- `src/lib/aark/` — the Orderly Network integration: `orderly-config.ts`
  (endpoints/domain/addresses, each comment-flagged with how confident it
  is), `orderly-types.ts` (EIP-712 struct + request shapes), and
  `orderly-client.ts` (the actual signing/request logic) — see "Aark
  Digital integration status" above for what's real vs. still a stub.
- `src/app/*` — Home, Markets, `/trade/[ticker]`, Discover +
  `/discover/[trader]`, Account.

## Other commands

```bash
npm run lint         # ESLint
npx tsc --noEmit      # type-check
npm run build         # production build (fully statically generated)
```
