import { ed25519 } from "@noble/curves/ed25519.js";
import { base58 } from "@scure/base";
import { encodeFunctionData, encodePacked, keccak256, type Address, type Hex } from "viem";
import {
  ARBITRUM_CHAIN_ID,
  ORDERLY_API_BASE,
  ORDERLY_EIP712_DOMAIN_NAME,
  ORDERLY_EIP712_DOMAIN_VERSION,
  ORDERLY_OFF_CHAIN_VERIFYING_CONTRACT,
  ORDERLY_VAULT_PROXY_ARBITRUM,
  USDC_ARBITRUM_ADDRESS,
  getBrokerId,
} from "./orderly-config";
import {
  ADD_ORDERLY_KEY_EIP712_TYPES,
  REGISTRATION_EIP712_TYPES,
  type DecodedDeposit,
  type OrderlyOrderRequest,
  type OrderlySessionKey,
  type VaultDepositFE,
} from "./orderly-types";

const ORDERLY_DOMAIN = {
  name: ORDERLY_EIP712_DOMAIN_NAME,
  version: ORDERLY_EIP712_DOMAIN_VERSION,
  chainId: ARBITRUM_CHAIN_ID,
  verifyingContract: ORDERLY_OFF_CHAIN_VERIFYING_CONTRACT,
} as const;

/**
 * Matches wagmi's `useSignTypedData().mutateAsync` shape without importing
 * wagmi here — this module is framework-agnostic; the caller (a client
 * component with a connected wallet) supplies the signer.
 */
type SignTypedDataAsync = (args: {
  domain: typeof ORDERLY_DOMAIN;
  types: Record<string, readonly { name: string; type: string }[]>;
  primaryType: string;
  message: Record<string, unknown>;
}) => Promise<Hex>;

/**
 * REST paths as documented across Orderly's public docs/SDKs. These carry
 * less confidence than the EIP-712 struct shapes in orderly-types.ts —
 * everything here came through search-engine summaries of pages this
 * environment couldn't fetch directly, and exact paths were the part that
 * varied most between sources. A 404 means check Orderly's REST API
 * reference for the current path, not that the surrounding logic is wrong.
 */
const ENDPOINTS = {
  registerAccount: "/v1/register_account",
  addOrderlyKey: "/v1/orderly_key",
  order: "/v1/order",
} as const;

function randomUint(bytesLength: number): bigint {
  const bytes = crypto.getRandomValues(new Uint8Array(bytesLength));
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  return n;
}

function base64url(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ---- Step 1: Registration (one-time, wallet-signed) ----

export async function registerAccount(
  account: Address,
  signTypedDataAsync: SignTypedDataAsync,
): Promise<unknown> {
  const timestamp = BigInt(Date.now());
  const registrationNonce = randomUint(8);
  const message = {
    brokerId: getBrokerId(),
    chainId: BigInt(ARBITRUM_CHAIN_ID),
    timestamp,
    registrationNonce,
  };

  const signature = await signTypedDataAsync({
    domain: ORDERLY_DOMAIN,
    types: REGISTRATION_EIP712_TYPES,
    primaryType: "Registration",
    message,
  });

  const res = await fetch(`${ORDERLY_API_BASE}${ENDPOINTS.registerAccount}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        brokerId: message.brokerId,
        chainId: ARBITRUM_CHAIN_ID,
        timestamp: Number(timestamp),
        registrationNonce: registrationNonce.toString(),
      },
      signature,
      userAddress: account,
    }),
  });
  if (!res.ok) {
    throw new Error(`Orderly registration failed: ${res.status} ${await res.text()}`);
  }
  // Response field names (account_id vs accountId, nesting) weren't independently
  // confirmed — inspect this at the call site rather than trusting an assumed shape.
  return res.json();
}

// ---- Step 2: Session key (the "session key framework" from the original ask) ----

/** Generates a local ed25519 keypair — this IS the session key. The secret key never leaves the browser. */
export function generateSessionKey(account: Address, validDays = 30): OrderlySessionKey {
  const { secretKey, publicKey } = ed25519.keygen();
  return {
    account,
    publicKey,
    secretKey,
    orderlyKeyId: `ed25519:${base58.encode(publicKey)}`,
    expiresAt: Math.floor(Date.now() / 1000) + validDays * 86400,
  };
}

/** Wallet-signs delegate authorization for `sessionKey` — this is the actual "delegate authorization" step. */
export async function authorizeSessionKey(
  account: Address,
  sessionKey: OrderlySessionKey,
  signTypedDataAsync: SignTypedDataAsync,
  scope = "trading",
): Promise<void> {
  const timestamp = BigInt(Date.now());
  const expiration = BigInt(sessionKey.expiresAt);
  const message = {
    brokerId: getBrokerId(),
    chainId: BigInt(ARBITRUM_CHAIN_ID),
    orderlyKey: sessionKey.orderlyKeyId,
    scope,
    timestamp,
    expiration,
  };

  const signature = await signTypedDataAsync({
    domain: ORDERLY_DOMAIN,
    types: ADD_ORDERLY_KEY_EIP712_TYPES,
    primaryType: "AddOrderlyKey",
    message,
  });

  const res = await fetch(`${ORDERLY_API_BASE}${ENDPOINTS.addOrderlyKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        brokerId: message.brokerId,
        chainId: ARBITRUM_CHAIN_ID,
        orderlyKey: message.orderlyKey,
        scope,
        timestamp: Number(timestamp),
        expiration: Number(expiration),
        chainType: "EVM",
      },
      signature,
      userAddress: account,
    }),
  });
  if (!res.ok) {
    throw new Error(`Orderly addOrderlyKey failed: ${res.status} ${await res.text()}`);
  }
}

// ---- Step 3: Order submission (per-order, session key signs — no wallet popup) ----

/** Signed content is `{timestamp}{method}{pathWithQuery}{body}`, ed25519-signed by the session key, base64url-encoded. */
export function signOrderlyRequest(
  sessionKey: OrderlySessionKey,
  method: "GET" | "POST" | "PUT" | "DELETE",
  pathWithQuery: string,
  body: string,
): { timestamp: number; signature: string } {
  const timestamp = Date.now();
  const normalized = `${timestamp}${method}${pathWithQuery}${body}`;
  const signature = ed25519.sign(new TextEncoder().encode(normalized), sessionKey.secretKey);
  return { timestamp, signature: base64url(signature) };
}

export async function submitOrder(
  sessionKey: OrderlySessionKey,
  accountId: string,
  order: OrderlyOrderRequest,
): Promise<unknown> {
  const body = JSON.stringify(order);
  const { timestamp, signature } = signOrderlyRequest(sessionKey, "POST", ENDPOINTS.order, body);

  const res = await fetch(`${ORDERLY_API_BASE}${ENDPOINTS.order}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "orderly-account-id": accountId,
      "orderly-key": sessionKey.orderlyKeyId,
      "orderly-timestamp": String(timestamp),
      "orderly-signature": signature,
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Orderly order submission failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// ---- Step 4: USDC margin deposit ----

const ERC20_APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

/** Real and certain: standard ERC-20 approve, no Orderly-specific guesswork involved. */
export function encodeUsdcApproval(spender: Address, amount: bigint): { to: Address; data: Hex } {
  return {
    to: USDC_ARBITRUM_ADDRESS,
    data: encodeFunctionData({ abi: ERC20_APPROVE_ABI, functionName: "approve", args: [spender, amount] }),
  };
}

/**
 * Reconstructed from confirmed real facts, not guessed from scratch:
 * - Vault.sol's public `deposit(VaultDepositFE calldata data)` signature
 *   (confirmed from GitHub source).
 * - The Vault's real `AccountDeposit`/`AccountWithdraw` event signatures
 *   (confirmed): both use `bytes32 accountId`, `bytes32 tokenHash`,
 *   `uint128 tokenAmount`; withdraw's event additionally carries
 *   `bytes32 brokerHash`, and the Vault separately tracks allowed brokers
 *   by `bytes32` hash (`setAllowedBroker(bytes32 _brokerHash, ...)`), so
 *   the deposit struct almost certainly carries the same fields.
 * - Documented behavior: "Account ID is derived from your wallet and the
 *   brokerId." keccak256(address ++ brokerHash) is the standard pattern
 *   for that in this class of contract.
 *
 * What's NOT confirmed: the exact struct field ORDER (matters for ABI
 * tuple encoding) and whether the frontend is expected to pass a
 * pre-derived accountId at all, versus the contract deriving it itself
 * from msg.sender. Wrong here doesn't revert loudly the way a bad EIP-712
 * signature does — it can misdirect funds. That's why this returns a
 * decoded, human-readable preview alongside the raw calldata rather than
 * just a "send" function: review it (ideally against what Aark's own app
 * actually sends, via its network tab) before broadcasting.
 */
function hashUtf8(value: string): Hex {
  return keccak256(encodePacked(["string"], [value]));
}

export function hashBrokerId(brokerId: string): Hex {
  return hashUtf8(brokerId);
}

export function hashTokenSymbol(symbol: string): Hex {
  return hashUtf8(symbol);
}

export function deriveAccountId(account: Address, brokerHash: Hex): Hex {
  return keccak256(encodePacked(["address", "bytes32"], [account, brokerHash]));
}

const VAULT_DEPOSIT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "data",
        type: "tuple",
        components: [
          { name: "accountId", type: "bytes32" },
          { name: "brokerHash", type: "bytes32" },
          { name: "tokenHash", type: "bytes32" },
          { name: "tokenAmount", type: "uint128" },
        ],
      },
    ],
    outputs: [],
  },
] as const;

export function decodeDepositForReview(account: Address, amountUsdc: number): DecodedDeposit {
  const brokerId = getBrokerId();
  const brokerHash = hashBrokerId(brokerId);
  const tokenHash = hashTokenSymbol("USDC");
  const accountId = deriveAccountId(account, brokerHash);
  return {
    account,
    brokerId,
    accountId,
    brokerHash,
    tokenHash,
    tokenSymbol: "USDC",
    amountUsdc: amountUsdc.toFixed(2),
    vaultAddress: ORDERLY_VAULT_PROXY_ARBITRUM,
  };
}

/** amountUsdc in whole USDC (e.g. 100.5), converted to USDC's 6 decimals. */
export function buildDepositCalldata(account: Address, amountUsdc: number): { to: Address; data: Hex } {
  const brokerHash = hashBrokerId(getBrokerId());
  const deposit: VaultDepositFE = {
    accountId: deriveAccountId(account, brokerHash),
    brokerHash,
    tokenHash: hashTokenSymbol("USDC"),
    tokenAmount: BigInt(Math.round(amountUsdc * 1_000_000)),
  };
  return {
    to: ORDERLY_VAULT_PROXY_ARBITRUM,
    data: encodeFunctionData({ abi: VAULT_DEPOSIT_ABI, functionName: "deposit", args: [deposit] }),
  };
}
