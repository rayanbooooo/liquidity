"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "grid grid-flow-col auto-cols-fr gap-1 rounded-xl border border-border-subtle bg-surface-2 p-1",
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg py-2 text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-foreground text-black"
              : "text-muted hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function LongShortToggle({
  value,
  onChange,
  className,
}: {
  value: "long" | "short";
  onChange: (value: "long" | "short") => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-1 rounded-xl border border-border-subtle bg-surface-2 p-1",
        className,
      )}
    >
      <button
        onClick={() => onChange("long")}
        className={cn(
          "rounded-lg py-3 text-sm font-semibold transition-colors",
          value === "long" ? "bg-long text-black" : "text-long/80 hover:text-long",
        )}
      >
        Long
      </button>
      <button
        onClick={() => onChange("short")}
        className={cn(
          "rounded-lg py-3 text-sm font-semibold transition-colors",
          value === "short" ? "bg-short text-black" : "text-short/80 hover:text-short",
        )}
      >
        Short
      </button>
    </div>
  );
}
