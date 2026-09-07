import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "long" | "short" | "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  long: "bg-long text-black hover:bg-long/90 active:bg-long/80",
  short: "bg-short text-black hover:bg-short/90 active:bg-short/80",
  primary: "bg-foreground text-black hover:bg-foreground/90",
  secondary: "bg-surface-2 text-foreground border border-border hover:bg-surface-3",
  outline: "bg-transparent text-foreground border border-border hover:bg-surface-2",
  ghost: "bg-transparent text-muted hover:text-foreground hover:bg-surface-2",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-14 px-5 text-base rounded-2xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
