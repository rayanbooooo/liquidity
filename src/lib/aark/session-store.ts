import { useSyncExternalStore } from "react";
import { bytesToHex, hexToBytes, type Address } from "viem";
import type { OrderlySessionKey } from "./orderly-types";

const STORAGE_KEY = "liquidity.aark.session.v1";
const CHANGE_EVENT = "liquidity:aark-session-changed";

interface StoredSession {
  account: Address;
  accountId: `0x${string}`;
  publicKey: `0x${string}`;
  secretKey: `0x${string}`;
  orderlyKeyId: string;
  expiresAt: number;
}

export interface AarkSession {
  sessionKey: OrderlySessionKey;
  accountId: `0x${string}`;
}

/**
 * localStorage by design — the session key is meant to be a hot,
 * limited-scope, time-bound credential stored client-side (that's the
 * whole point of the "session key" pattern vs. the wallet's own key).
 * Scoped per-browser only; never sent anywhere except signed Orderly
 * requests.
 */
export function saveSession(sessionKey: OrderlySessionKey, accountId: `0x${string}`): void {
  if (typeof window === "undefined") return;
  const stored: StoredSession = {
    account: sessionKey.account,
    accountId,
    publicKey: bytesToHex(sessionKey.publicKey),
    secretKey: bytesToHex(sessionKey.secretKey),
    orderlyKeyId: sessionKey.orderlyKeyId,
    expiresAt: sessionKey.expiresAt,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Private browsing / storage disabled — session just won't persist across reloads.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore
  }
}

function parseSession(raw: string, account: Address): AarkSession | null {
  try {
    const stored = JSON.parse(raw) as StoredSession;
    if (stored.account.toLowerCase() !== account.toLowerCase()) return null;
    if (stored.expiresAt * 1000 < Date.now()) return null;
    return {
      accountId: stored.accountId,
      sessionKey: {
        account: stored.account,
        publicKey: hexToBytes(stored.publicKey),
        secretKey: hexToBytes(stored.secretKey),
        orderlyKeyId: stored.orderlyKeyId,
        expiresAt: stored.expiresAt,
      },
    };
  } catch {
    return null;
  }
}

// useSyncExternalStore requires getSnapshot to return a stable (===) reference
// when nothing changed, so this only re-parses when the raw string or the
// address actually differs from last time — otherwise it hands back the same
// cached object, avoiding an infinite render loop.
let cachedRaw: string | null = null;
let cachedAddress: Address | undefined;
let cachedSession: AarkSession | null = null;

function getSnapshot(address: Address | undefined): AarkSession | null {
  if (typeof window === "undefined" || !address) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw && address === cachedAddress) return cachedSession;
  cachedRaw = raw;
  cachedAddress = address;
  cachedSession = raw ? parseSession(raw, address) : null;
  return cachedSession;
}

function getServerSnapshot(): null {
  return null;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Reactively tracks the persisted Aark session for `address` — updates live when saveSession/clearSession run anywhere in the app. */
export function useAarkSession(address: Address | undefined): AarkSession | null {
  return useSyncExternalStore(subscribe, () => getSnapshot(address), getServerSnapshot);
}
