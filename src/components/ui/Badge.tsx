import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/calc";

export function ChangeBadge({
  value,
  size = "md",
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md font-mono font-medium tabular-nums",
        positive ? "bg-long-dim text-long" : "bg-short-dim text-short",
        size === "sm" && "px-1.5 py-0.5 text-[11px]",
        size === "md" && "px-2 py-1 text-xs",
        size === "lg" && "px-2.5 py-1.5 text-sm",
        className,
      )}
    >
      {formatPct(value)}
    </span>
  );
}

export function SideBadge({ side, className }: { side: "long" | "short"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        side === "long" ? "bg-long-dim text-long" : "bg-short-dim text-short",
        className,
      )}
    >
      {side}
    </span>
  );
}

export function LeverageBadge({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted",
        className,
      )}
    >
      {value}x
    </span>
  );
}
