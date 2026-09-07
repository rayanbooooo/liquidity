import type { AssetClass } from "@/lib/types";

const CLASS_COLORS: Record<AssetClass, [string, string]> = {
  crypto: ["#8b5cf6", "#6366f1"],
  forex: ["#22d3ee", "#3b82f6"],
  commodity: ["#eab308", "#f97316"],
};

export function AssetIcon({
  symbol,
  assetClass,
  size = 36,
}: {
  symbol: string;
  assetClass: AssetClass;
  size?: number;
}) {
  const [from, to] = CLASS_COLORS[assetClass];
  const label = symbol.replace("USD", "").slice(0, 3);

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-sans font-bold text-black"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {label}
    </div>
  );
}
