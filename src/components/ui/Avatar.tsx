import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  from,
  to,
  size = 40,
  className,
}: {
  initials: string;
  from: string;
  to: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-sans font-semibold text-black",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {initials}
    </div>
  );
}
