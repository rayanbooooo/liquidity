import type { Address } from "viem";

/**
 * EIP-712 struct field order matters for the type hash, not just field
 * names — this order is as documented by Orderly, not alphabetized or
 * reordered for readability.
 */
export const REGISTRATION_EIP712_TYPES = {
  Registration: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "timestamp", type: "uint64" },
    { name: "registrationNonce", type: "uint256" },
  ],
} as const;

export interface RegistrationMessage {
  brokerId: string;
  chainId: number;
  timestamp: number;
  registrationNonce: string;
}

/**
 * The "session key" mechanism: signing this authorizes a separate,
 * client-generated ed25519 keypair (see OrderlySessionKey) to trade on the
 * signer's behalf, scoped and time-limited, without a wallet popup per
 * order. `chainType`/`tag`/`subAccountId` travel in the API request
 * alongside the signature but — per Orderly's docs — are NOT part of the
 * signed struct itself; including them in the EIP-712 type would produce
 * a different (invalid) signature.
 */
export const ADD_ORDERLY_KEY_EIP712_TYPES = {
  AddOrderlyKey: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "orderlyKey", type: "string" },
    { name: "scope", type: "string" },
    { name: "timestamp", type: "uint64" },
    { name: "expiration", type: "uint64" },
  ],
} as const;

export interface AddOrderlyKeyMessage {
  brokerId: string;
  chainId: number;
  orderlyKey: string;
  scope: string;
  timestamp: number;
  expiration: number;
}

export interface OrderlySessionKey {
  account: Address;
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  /** The `orderlyKey`/`orderly-key` header value: "ed25519:" + base58(publicKey). */
  orderlyKeyId: string;
  expiresAt: number;
}

export type OrderlyOrderType = "MARKET" | "LIMIT" | "IOC" | "FOK" | "POST_ONLY";
export type OrderlySide = "BUY" | "SELL";

export interface OrderlyOrderRequest {
  /** Orderly's own instrument format (e.g. "PERP_BTC_USDC"), not this app's `symbol`. */
  symbol: string;
  order_type: OrderlyOrderType;
  side: OrderlySide;
  order_quantity?: number;
  order_price?: number;
  reduce_only?: boolean;
}
