/**
 * Aark Digital doesn't run its own trading backend — it's a white-label
 * front-end over Orderly Network's shared omnichain orderbook (confirmed:
 * Orderly's own announcement of the partnership, corroborated by Aark's
 * blog referencing Orderly's off-chain execution model). That's genuinely
 * useful, because Orderly — unlike Aark — publishes real public docs and
 * open-source SDKs. Everything below is sourced from those: Orderly's
 * "Wallet Authentication" docs, the OrderlyNetwork/js-sdk and
 * orderly-evm-connector-python repos on GitHub, cross-checked across
 * multiple independent fetches. It was assembled through web search
 * summaries of pages this environment can't fetch directly (orderly.network
 * itself is blocked here) — internally consistent across every source
 * checked, but not a byte-for-byte read of Orderly's raw docs. Confirm
 * against Orderly's docs directly before this ever touches real funds.
 */

export const ARBITRUM_CHAIN_ID = 42161;

export const ORDERLY_API_BASE = "https://api.orderly.org";
export const ORDERLY_TESTNET_API_BASE = "https://testnet-api.orderly.org";

/**
 * Off-chain-only EIP-712 messages (Registration, AddOrderlyKey) use this
 * sentinel address as `verifyingContract` — Orderly's convention for typed
 * data that isn't tied to an on-chain contract call.
 */
export const ORDERLY_OFF_CHAIN_VERIFYING_CONTRACT =
  "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC" as const;

export const ORDERLY_EIP712_DOMAIN_NAME = "Orderly";
export const ORDERLY_EIP712_DOMAIN_VERSION = "1";

/** Native (Circle-issued) USDC on Arbitrum One — verified against Arbiscan, not USDC.e. */
export const USDC_ARBITRUM_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as const;

/**
 * Orderly's Vault Proxy on Arbitrum One (Arbiscan labels it "Orderly
 * Network: Vault Proxy"). Lower confidence than the rest of this file:
 * Orderly separately runs an "OmniVault" yield product with its own
 * deposit flow, and it isn't confirmed this is the *trading margin*
 * vault rather than (or in addition to) that. Confirm on Orderly's own
 * contract-addresses doc page before depositing real funds.
 */
export const ORDERLY_VAULT_PROXY_ARBITRUM = "0x816f722424b49cf1275cc86da9840fbd5a6167e9" as const;

/**
 * Every broker running on Orderly has its own broker_id — this is what
 * actually identifies "Aark" to Orderly's backend, and it is NOT
 * discoverable by guessing. Orderly exposes a public endpoint for looking
 * up registered broker_ids per chain (referenced in their docs as
 * "chain_info" under the Public Info API); the exact path wasn't pinned
 * down with confidence. Easiest real path: open Aark's own app, watch the
 * network tab for any request carrying a `brokerId` field, and set it
 * here — never invent a value.
 */
export function getBrokerId(): string {
  const brokerId = process.env.NEXT_PUBLIC_AARK_BROKER_ID;
  if (!brokerId) {
    throw new Error(
      "NEXT_PUBLIC_AARK_BROKER_ID is not set. Aark's broker_id on Orderly Network has to be " +
        "confirmed (Aark's own app network tab, or Orderly's broker/chain_info endpoint) — it " +
        "can't be guessed without risking signing a message for the wrong broker.",
    );
  }
  return brokerId;
}
