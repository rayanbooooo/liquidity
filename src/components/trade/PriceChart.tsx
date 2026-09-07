"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
  type UTCTimestamp,
  createChart,
} from "lightweight-charts";
import { cn } from "@/lib/utils";
import { CHART_RANGE_KEYS, type ChartRange, getCandleSeries } from "@/lib/mock-data";

type ChartType = "candles" | "line";

export function PriceChart({ symbol, decimals }: { symbol: string; decimals: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const [range, setRange] = useState<ChartRange>("1H");
  const [chartType, setChartType] = useState<ChartType>("candles");

  const candles = useMemo(() => getCandleSeries(symbol, range), [symbol, range]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#71717a",
        fontFamily: "var(--font-numeric)",
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(255,255,255,0.18)", width: 1, labelBackgroundColor: "#1c1c20" },
        horzLine: { color: "rgba(255,255,255,0.18)", width: 1, labelBackgroundColor: "#1c1c20" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      width: container.clientWidth,
      height: container.clientHeight,
    });
    chartRef.current = chart;

    const resize = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      chart.applyOptions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    resize.observe(container);

    return () => {
      resize.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    chart.applyOptions({ localization: { priceFormatter: (p: number) => p.toFixed(decimals) } });

    if (chartType === "candles") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#00e676",
        downColor: "#ff5252",
        borderVisible: false,
        wickUpColor: "#00e676",
        wickDownColor: "#ff5252",
        priceFormat: { type: "price", precision: decimals, minMove: 1 / 10 ** decimals },
      });
      series.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })),
      );
      seriesRef.current = series;
    } else {
      const rising = candles[candles.length - 1]?.close >= candles[0]?.close;
      const series = chart.addSeries(AreaSeries, {
        lineColor: rising ? "#00e676" : "#ff5252",
        topColor: rising ? "rgba(0,230,118,0.28)" : "rgba(255,82,82,0.28)",
        bottomColor: "rgba(0,0,0,0)",
        lineWidth: 2,
        priceFormat: { type: "price", precision: decimals, minMove: 1 / 10 ** decimals },
      });
      series.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.close })));
      seriesRef.current = series;
    }

    chart.timeScale().fitContent();
  }, [candles, chartType, decimals]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-5">
        <div className="flex gap-1">
          {CHART_RANGE_KEYS.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                range === r ? "bg-surface-2 text-foreground" : "text-muted-2 hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["candles", "line"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-semibold capitalize transition-colors",
                chartType === t ? "bg-surface-2 text-foreground" : "text-muted-2 hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="h-[280px] w-full" />
    </div>
  );
}
