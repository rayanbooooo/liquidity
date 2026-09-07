"use client";

import { AlertTriangle, LogOut, Wallet } from "lucide-react";
import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { cn } from "@/lib/utils";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWalletButton({ className }: { className?: string }) {
  const connection = useConnection();
  const connectors = useConnectors();
  const { mutate: connect, isPending: isConnecting, error: connectError } = useConnect();
  const { mutate: disconnect } = useDisconnect();
  const { mutate: switchChain, isPending: isSwitching } = useSwitchChain();

  if (connection.status === "connected") {
    const wrongNetwork = connection.chainId !== arbitrum.id;

    if (wrongNetwork) {
      return (
        <button
          onClick={() => switchChain({ chainId: arbitrum.id })}
          disabled={isSwitching}
          className={cn(
            "flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-2.5 text-sm font-medium text-warning disabled:opacity-60",
            className,
          )}
        >
          <AlertTriangle size={15} />
          {isSwitching ? "Switching..." : "Wrong network · Switch to Arbitrum"}
        </button>
      );
    }

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-long" />
          <span className="font-mono text-sm font-medium tabular-nums">
            {truncateAddress(connection.address)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          aria-label="Disconnect wallet"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-surface-2 text-muted-2 hover:text-foreground"
        >
          <LogOut size={15} />
        </button>
      </div>
    );
  }

  const injectedConnector = connectors[0];

  return (
    <div className={className}>
      <button
        onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        disabled={isConnecting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-long py-3 text-sm font-semibold text-black disabled:opacity-60"
      >
        <Wallet size={16} />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {connectError && (
        <p className="mt-2 text-center text-[11px] text-muted-2">
          No wallet detected —{" "}
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-long underline"
          >
            install MetaMask
          </a>{" "}
          or open this page from inside a wallet app.
        </p>
      )}
    </div>
  );
}
