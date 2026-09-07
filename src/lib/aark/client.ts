import type {
  MarginDepositRequest,
  OrderRequest,
  OrderResult,
  SessionKeyAuthorization,
} from "./types";

/**
 * Thrown by every function in this module. Aark Digital's session-key /
 * order-signing integration is not implemented — see README.md, "Aark
 * Digital integration status" for exactly what's missing and why. This
 * throws loudly on purpose: a stub that silently "succeeds" on a
 * 1000x-leverage trading flow is far worse than one that fails clearly.
 */
export class AarkNotConfiguredError extends Error {
  constructor(operation: string, needs: string) {
    super(`Aark Digital integration not configured: ${operation} needs ${needs}.`);
    this.name = "AarkNotConfiguredError";
  }
}

/**
 * Would sign an EIP-712 delegate-authorization message granting a
 * client-generated session key limited authority to trade on the
 * connected wallet's behalf, then register it with Aark.
 *
 * Needs, from Aark: the session-key registry contract address on
 * Arbitrum One, its ABI, and the exact EIP-712 domain (name/version/
 * chainId/verifyingContract) and type definitions for the authorization
 * struct — field names, types, and order all have to match their
 * contract exactly or the signature won't verify.
 */
export async function requestSessionKeyAuthorization(): Promise<SessionKeyAuthorization> {
  throw new AarkNotConfiguredError(
    "requestSessionKeyAuthorization",
    "Aark's session-key contract address, ABI, and EIP-712 type definitions",
  );
}

/**
 * Would deposit USDC margin, gaslessly, into the user's Aark collateral
 * account.
 *
 * Needs, from Aark: how "gasless" is actually implemented on their end —
 * a meta-transaction relayer they operate, an ERC-2612 `permit` + relay
 * flow, an ERC-4337 paymaster, or something else entirely — plus the
 * vault/collateral contract address and its deposit function signature.
 */
export async function depositMargin(_request: MarginDepositRequest): Promise<void> {
  throw new AarkNotConfiguredError(
    "depositMargin",
    "Aark's gasless-deposit mechanism (relayer/permit/paymaster) and collateral contract address",
  );
}

/**
 * Would construct and sign an order payload and submit it through Aark's
 * execution pipeline using an authorized session key.
 *
 * Needs, from Aark: their order struct's exact EIP-712 type definition,
 * the instrument-identifier format they expect (this app's `symbol` is
 * very unlikely to match it directly), and the submission endpoint/
 * contract the signed payload actually gets sent to.
 */
export async function submitOrder(_request: OrderRequest): Promise<OrderResult> {
  throw new AarkNotConfiguredError(
    "submitOrder",
    "Aark's order EIP-712 type definition, instrument-id format, and submission endpoint",
  );
}
