import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/calc";

export function ChangeBadge({
  value,
  size = "md",
  plain = false,
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  /** Text-color only, no pill background — for dense lists where a badge per row reads as wallpaper. */
  plain?: boolean;
  className?: string;
}) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono font-medium tabular-nums",
        positive ? "text-long" : "text-short",
        plain ? "" : cn("rounded-md", positive ? "bg-long-dim" : "bg-short-dim"),
        size === "sm" && (plain ? "text-[11px]" : "px-1.5 py-0.5 text-[11px]"),
        size === "md" && (plain ? "text-xs" : "px-2 py-1 text-xs"),
        size === "lg" && (plain ? "text-sm" : "px-2.5 py-1.5 text-sm"),
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
