import { createConfig, http, injected } from "wagmi";
import { arbitrum } from "wagmi/chains";

/**
 * Aark Digital runs on Arbitrum One — this is the only chain this app talks
 * to. `injected()` covers browser wallets (MetaMask, Rabby, Coinbase Wallet
 * extension, ...). WalletConnect (for mobile / QR-code connection) needs a
 * project id from https://cloud.reown.com — add it via
 * NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID and wire up `walletConnect()` here
 * once you have one; a placeholder id just fails silently, so it's left out
 * rather than faked.
 */
export const wagmiConfig = createConfig({
  chains: [arbitrum],
  connectors: [injected()],
  transports: {
    [arbitrum.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
