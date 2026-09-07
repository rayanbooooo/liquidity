"use client";

import { CandlestickChart, Compass, Home, User, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/markets",
    label: "Markets",
    icon: CandlestickChart,
    match: (p: string) => p.startsWith("/markets"),
  },
  {
    href: "/trade/BTC",
    label: "Trade",
    icon: Zap,
    match: (p: string) => p.startsWith("/trade"),
    primary: true,
  },
  {
    href: "/discover",
    label: "Discover",
    icon: Compass,
    match: (p: string) => p.startsWith("/discover"),
  },
  {
    href: "/account",
    label: "Account",
    icon: User,
    match: (p: string) => p.startsWith("/account"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-black/85 backdrop-blur-xl">
      <div className="flex items-end justify-between px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2">
        {TABS.map(({ href, label, icon: Icon, match, primary }) => {
          const active = match(pathname);

          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    "-mt-6 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border transition-all",
                    active
                      ? "border-long/40 bg-long text-black shadow-[0_8px_24px_-6px_var(--long)]"
                      : "border-border bg-surface-2 text-long",
                  )}
                >
                  <Icon size={22} strokeWidth={2.25} />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium tracking-wide",
                    active ? "text-foreground" : "text-muted-2",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              <Icon
                size={22}
                strokeWidth={2.25}
                className={active ? "text-foreground" : "text-muted-2"}
              />
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide",
                  active ? "text-foreground" : "text-muted-2",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
