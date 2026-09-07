"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function FavoriteButton({ className }: { className?: string }) {
  const [active, setActive] = useState(false);
  return (
    <button
      onClick={() => setActive((v) => !v)}
      aria-label="Toggle watchlist"
      aria-pressed={active}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface-2 transition-colors",
        className,
      )}
    >
      <Star size={16} className={active ? "fill-warning text-warning" : "text-muted"} />
    </button>
  );
}
