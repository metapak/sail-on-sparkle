/**
 * Unovis chart implementations (browser-only).
 *
 * This module is loaded lazily by the shared chart adapters so the D3-based
 * Unovis runtime never evaluates during SSR/prerender. Nothing outside the
 * shared chart layer may import this file.
 *
 * Rank semantics: Unovis has no per-axis inversion flag, so rank series are
 * plotted as negative values and formatted back to positive ranks on axes,
 * crosshair, and tooltips. Rank 1 therefore renders at the top and larger
 * rank values lower.
 *
 * Missing values (e.g. "Top 200 içinde bulunamadı") are passed as `undefined`
 * so the line renders a real gap instead of a fabricated floor value.
 */
import * as React from "react";
import {
  VisXYContainer,
  VisLine,
  VisArea,
  VisAxis,
  VisCrosshair,
  VisTooltip,
  VisScatter,
} from "@unovis/react";
import { CurveType, SymbolType } from "@unovis/ts";
import { SHARED_AXIS_PRESET, SHARED_GRID_PRESET, SHARED_CHART_ANIMATION } from "./chart-presets";

export interface UnovisSeriesSpec {
  id: string;
  label: string;
  color: string;
  dashed?: boolean;
  strokeWidth?: number;
}

/** Optional annotation rendered as a small diamond at a datum index. */
export interface UnovisMarkerSpec {
  index: number;
  label?: string;
}

export interface UnovisLineChartProps {
  /** X tick labels, one per datum. */
  labels: string[];
  /** One record per datum: { [seriesId]: number }. */
  values: Record<string, number>[];
  series: UnovisSeriesSpec[];
  height: number;
  /** Invert value axis (rank charts). */
  reversed?: boolean;
  formatValue: (v: number) => string;
  /** Approximate number of x ticks. */
  numXTicks?: number;
  showYAxis?: boolean;
  showXAxis?: boolean;
  /** Render a soft area under the first series (single-series charts). */
  showArea?: boolean;
  /** Event annotations (diamond glyphs). */
  markers?: UnovisMarkerSpec[];
  /** Extra tooltip rows appended after the series rows. */
  tooltipExtra?: (index: number) => string;
  /**
   * Hard lower bound in REAL value space (before rank inversion). Rank charts
   * pass `1` so the axis can never render an impossible "#0" tick.
   */
  valueMin?: number;
  /** Round axis ticks to whole numbers (rank / count charts). */
  integerTicks?: boolean;
}

interface Point {
  x: number;
  [seriesId: string]: number | undefined;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export default function UnovisLineChart({
  labels,
  values,
  series,
  height,
  reversed = false,
  formatValue,
  numXTicks = 6,
  showYAxis = true,
  showXAxis = true,
  showArea = false,
  markers,
  tooltipExtra,
  valueMin,
  integerTicks = false,
}: UnovisLineChartProps) {
  const sign = reversed ? -1 : 1;
  const reducedMotion = usePrefersReducedMotion();
  const duration = reducedMotion ? 0 : SHARED_CHART_ANIMATION.duration;

  const data = React.useMemo<Point[]>(
    () =>
      values.map((row, i) => {
        const p: Point = { x: i };
        for (const s of series) {
          const raw = Number(row[s.id]);
          // undefined → real gap in the line (missing observation).
          p[s.id] = Number.isFinite(raw) ? raw * sign : undefined;
        }
        return p;
      }),
    [values, series, sign],
  );

  /**
   * Actual data range + 10% padding (never a fixed 0–200 domain), clamped to
   * the semantic bound when one exists. For rank charts (`reversed`, values
   * plotted negative) the padded edge nearest "best rank" is capped at
   * `-valueMin`, which is what removes the impossible `#0` tick.
   */
  const yDomain = React.useMemo<[number, number] | undefined>(() => {
    const nums: number[] = [];
    for (const p of data) {
      for (const s of series) {
        const v = p[s.id];
        if (typeof v === "number" && Number.isFinite(v)) nums.push(v);
      }
    }
    if (!nums.length) return undefined;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const pad = Math.max((max - min) * 0.1, 0.5);
    let lower = min - pad;
    let upper = max + pad;
    if (typeof valueMin === "number") {
      if (reversed) upper = Math.min(upper, -valueMin);
      else lower = Math.max(lower, valueMin);
    }
    if (lower >= upper) {
      // Degenerate (single distinct value) — keep a readable 1-unit window.
      lower = upper - 1;
    }
    return [lower, upper];
  }, [data, series, valueMin, reversed]);

  const yAccessors = React.useMemo(() => series.map((s) => (d: Point) => d[s.id]), [series]);

  // Unovis XY components inherit the container dataset, so annotations are
  // rendered by masking non-event points to `undefined` rather than by passing
  // a separate (ignored) `data` array to the scatter layer.
  const markerXs = React.useMemo(() => {
    const first = series[0];
    if (!markers?.length || !first) return null;
    const xs = new Set<number>();
    for (const m of markers) {
      const point = data[m.index];
      if (point && typeof point[first.id] === "number") xs.add(point.x);
    }
    return xs.size > 0 ? xs : null;
  }, [markers, data, series]);

  const markerY = React.useCallback(
    (d: Point) => {
      const first = series[0];
      if (!markerXs || !first || !markerXs.has(d.x)) return undefined;
      return d[first.id];
    },
    [markerXs, series],
  );

  const tooltipTemplate = React.useCallback(
    (d: Point) => {
      const rows = series
        .map((s) => {
          const v = d[s.id];
          if (typeof v !== "number" || !Number.isFinite(v)) return "";
          return `<div class="sonar-tt-row"><span class="sonar-tt-dot" style="background:${s.color}"></span><span class="sonar-tt-label">${s.label}</span><span class="sonar-tt-value">${formatValue(v * sign)}</span></div>`;
        })
        .join("");
      const extra = tooltipExtra?.(d.x) ?? "";
      return `<div class="sonar-tt"><div class="sonar-tt-title">${labels[d.x] ?? ""}</div>${rows}${extra}</div>`;
    },
    [series, labels, formatValue, sign, tooltipExtra],
  );

  return (
    <div style={{ height, width: "100%" }} className="sonar-unovis">
      <VisXYContainer<Point>
        data={data}
        height={height}
        yDomain={yDomain}
        margin={{ top: 10, right: 12, bottom: 4, left: 4 }}
      >
        {showArea && !reversed && series[0] && (
          <VisArea<Point>
            x={(d: Point) => d.x}
            y={yAccessors[0]}
            color={series[0].color}
            curveType={CurveType.MonotoneX}
            opacity={0.1}
            duration={duration}
          />
        )}

        {series.map((s, i) => (
          <VisLine<Point>
            key={s.id}
            x={(d: Point) => d.x}
            y={yAccessors[i]}
            color={s.color}
            lineWidth={s.strokeWidth ?? (i === 0 ? 2 : 1.5)}
            lineDashArray={s.dashed ? [4, 4] : undefined}
            curveType={CurveType.MonotoneX}
            duration={duration}
          />
        ))}

        {markerXs && series[0] && (
          <VisScatter<Point>
            x={(d: Point) => d.x}
            y={markerY}
            color={series[0].color}
            shape={SymbolType.Diamond}
            size={9}
            duration={duration}
          />
        )}

        <VisCrosshair<Point>
          template={tooltipTemplate}
          color={series[0]?.color}
          strokeColor={SHARED_GRID_PRESET.crosshairStroke}
        />
        <VisTooltip />

        {showXAxis && (
          <VisAxis<Point>
            type="x"
            numTicks={numXTicks}
            tickFormat={(tick: number | Date) => labels[Math.round(Number(tick))] ?? ""}
            gridLine={false}
            tickLine={false}
            domainLine={false}
            tickTextColor={SHARED_AXIS_PRESET.tickColor}
            tickTextFontSize={`${SHARED_AXIS_PRESET.tickFontSize}px`}
          />
        )}
        {showYAxis && (
          <VisAxis<Point>
            type="y"
            numTicks={4}
            tickFormat={(tick: number | Date) => {
              const raw = Number(tick) * sign;
              const v = integerTicks ? Math.round(raw) : raw;
              // Never label a value the metric cannot take (e.g. rank #0).
              if (typeof valueMin === "number" && v < valueMin) return "";
              return formatValue(v);
            }}
            gridLine
            tickLine={false}
            domainLine={false}
            tickTextColor={SHARED_AXIS_PRESET.tickColor}
            tickTextFontSize={`${SHARED_AXIS_PRESET.tickFontSize}px`}
          />
        )}
      </VisXYContainer>
    </div>
  );
}
