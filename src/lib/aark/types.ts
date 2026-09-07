import type { Address, Hex } from "viem";
import type { Side } from "@/lib/types";

/**
 * Everything in this file is a *shape guess* based on what session-key /
 * delegate-authorization systems typically look like (see e.g. ERC-7579
 * smart sessions) — NOT verified against Aark Digital's actual contracts.
 * Aark doesn't publish a public SDK or contract ABI, and their docs site is
 * unreachable from this environment. Treat every field here as provisional
 * until checked against Aark's real EIP-712 domain/types (ideally sourced
 * from their own SDK, or their verified contract source on Arbiscan).
 */

export interface SessionKeyAuthorization {
  /** The wallet granting authority (the connected EOA). */
  account: Address;
  /** The session key's own address — a throwaway keypair generated client-side. */
  sessionKey: Address;
  /** Unix seconds. */
  expiresAt: number;
  /** EIP-712 signature from `account` authorizing `sessionKey`. Shape TBD. */
  signature: Hex;
}

export interface MarginDepositRequest {
  account: Address;
  /** USDC, 6 decimals. */
  amount: bigint;
}

export interface OrderRequest {
  account: Address;
  /** Aark's own instrument identifier — not necessarily this app's `symbol`. */
  instrument: string;
  side: Side;
  leverage: number;
  /** USD notional size. */
  size: number;
  orderType: "market" | "limit" | "stop";
  limitPrice?: number;
}

export interface OrderResult {
  orderId: string;
  txHash: Hex;
}
