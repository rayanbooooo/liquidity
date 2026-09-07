import { useId } from "react";

type Point = readonly [number, number];

/** Catmull-Rom -> cubic Bezier, so lines read as a curve, not a zigzag. */
function smoothPath(points: readonly Point[]): string {
  if (points.length < 3) {
    return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  }
  let d = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  tone?: "long" | "short" | "neutral" | "auto";
  strokeWidth?: number;
  fill?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 96,
  height = 32,
  tone = "auto",
  strokeWidth = 1.75,
  fill = true,
  className,
}: SparklineProps) {
  const gradientId = useId();

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((value, i) => {
    const x = i * stepX;
    const y = height - ((value - min) / range) * height;
    return [x, y] as const;
  });

  const resolvedTone = tone === "auto" ? (data[data.length - 1] >= data[0] ? "long" : "short") : tone;
  const color =
    resolvedTone === "long" ? "var(--long)" : resolvedTone === "short" ? "var(--short)" : "var(--muted-2)";

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      {fill && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
