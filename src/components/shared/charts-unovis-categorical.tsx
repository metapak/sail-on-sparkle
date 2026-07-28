/**
 * Unovis categorical implementations (browser-only): bar + scatter.
 *
 * Loaded lazily by the shared chart adapters so the D3-based Unovis runtime
 * never evaluates during SSR/prerender. Nothing outside the shared chart
 * layer may import this file.
 */
import * as React from "react";
import {
  VisXYContainer,
  VisGroupedBar,
  VisScatter,
  VisAxis,
  VisTooltip,
  VisCrosshair,
} from "@unovis/react";
import { SymbolType } from "@unovis/ts";
import { SHARED_AXIS_PRESET, SHARED_GRID_PRESET, SHARED_CHART_ANIMATION } from "./chart-presets";
import type { UnovisSeriesSpec } from "./charts-unovis";

export interface UnovisCategoricalChartProps {
  /** `"bar"` = grouped bars over categories, `"scatter"` = xy point cloud. */
  kind: "bar" | "scatter";
  /** X tick labels (bar) — one per datum. */
  labels: string[];
  /** One record per datum: { [seriesId]: number }. Scatter uses `x`/`y` keys. */
  values: Record<string, number>[];
  series: UnovisSeriesSpec[];
  height: number;
  formatValue: (v: number) => string;
  /** Scatter only: formatter for the x axis. */
  formatX?: (v: number) => string;
  numXTicks?: number;
  /** Scatter only: point radius accessor key. */
  sizeKey?: string;
}

interface Point {
  x: number;
  [key: string]: number | undefined;
}

export default function UnovisCategoricalChart({
  kind,
  labels,
  values,
  series,
  height,
  formatValue,
  formatX,
  numXTicks = 6,
  sizeKey,
}: UnovisCategoricalChartProps) {
  const data = React.useMemo<Point[]>(
    () =>
      values.map((row, i) => {
        const p: Point = { x: kind === "scatter" ? Number(row.x ?? i) : i };
        for (const key of Object.keys(row)) {
          const v = Number(row[key]);
          p[key] = Number.isFinite(v) ? v : undefined;
        }
        return p;
      }),
    [values, kind],
  );

  const yAccessors = React.useMemo(() => series.map((s) => (d: Point) => d[s.id]), [series]);

  const tooltipTemplate = React.useCallback(
    (d: Point) => {
      const title =
        kind === "scatter" ? (formatX ? formatX(d.x) : String(d.x)) : (labels[d.x] ?? "");
      const rows = series
        .map((s) => {
          const v = d[s.id];
          if (typeof v !== "number") return "";
          return `<div class="sonar-tt-row"><span class="sonar-tt-dot" style="background:${s.color}"></span><span class="sonar-tt-label">${s.label}</span><span class="sonar-tt-value">${formatValue(v)}</span></div>`;
        })
        .join("");
      return `<div class="sonar-tt"><div class="sonar-tt-title">${title}</div>${rows}</div>`;
    },
    [series, labels, formatValue, formatX, kind],
  );

  return (
    <div style={{ height, width: "100%" }} className="sonar-unovis">
      <VisXYContainer<Point>
        data={data}
        height={height}
        margin={{ top: 10, right: 12, bottom: 4, left: 4 }}
      >
        {kind === "bar" ? (
          <VisGroupedBar<Point>
            x={(d: Point) => d.x}
            y={yAccessors}
            color={(_d: Point, i: number) => series[i % series.length]?.color ?? series[0]?.color}
            roundedCorners={3}
            groupPadding={0.2}
            duration={SHARED_CHART_ANIMATION.duration}
          />
        ) : (
          <VisScatter<Point>
            x={(d: Point) => d.x}
            y={yAccessors[0]}
            color={series[0]?.color}
            shape={SymbolType.Circle}
            size={(d: Point) => (sizeKey ? Math.max(6, Number(d[sizeKey] ?? 8)) : 8)}
            duration={SHARED_CHART_ANIMATION.duration}
          />
        )}

        <VisCrosshair<Point>
          template={tooltipTemplate}
          color={series[0]?.color}
          strokeColor={SHARED_GRID_PRESET.crosshairStroke}
        />
        <VisTooltip />

        <VisAxis<Point>
          type="x"
          numTicks={numXTicks}
          tickFormat={(tick: number | Date) =>
            kind === "scatter"
              ? (formatX?.(Number(tick)) ?? String(Number(tick)))
              : (labels[Math.round(Number(tick))] ?? "")
          }
          gridLine={false}
          tickLine={false}
          domainLine={false}
          tickTextColor={SHARED_AXIS_PRESET.tickColor}
          tickTextFontSize={`${SHARED_AXIS_PRESET.tickFontSize}px`}
        />
        <VisAxis<Point>
          type="y"
          numTicks={4}
          tickFormat={(tick: number | Date) => formatValue(Number(tick))}
          gridLine
          tickLine={false}
          domainLine={false}
          tickTextColor={SHARED_AXIS_PRESET.tickColor}
          tickTextFontSize={`${SHARED_AXIS_PRESET.tickFontSize}px`}
        />
      </VisXYContainer>
    </div>
  );
}
