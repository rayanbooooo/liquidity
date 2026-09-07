import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuickActionPillProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  label: string;
  emphasis?: boolean;
}

/** Presentational only — wrap in <Link> or <button> depending on the action. */
export function QuickActionPill({ icon, label, emphasis, className, ...props }: QuickActionPillProps) {
  return (
    <div className={cn("flex flex-1 flex-col items-center gap-2", className)} {...props}>
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors",
          emphasis
            ? "border-long/30 bg-long-dim text-long"
            : "border-border-subtle bg-surface-2 text-foreground",
        )}
      >
        {icon}
      </span>
      <span className="text-[11px] font-medium text-muted">{label}</span>
    </div>
  );
}

export function FilterChip({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-black"
          : "border-border-subtle bg-transparent text-muted hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
