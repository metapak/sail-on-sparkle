/**
 * Shared chart adapters — implementation-neutral surface for pages.
 *
 * Engine map (see also ./rank-history):
 *  - MetricTrendChart / MultiSeriesTrendChart / MiniRankChart → Unovis
 *    (lazy-loaded in the browser; SSR renders the shared loading frame).
 *  - SharedSparkline → Recharts (tiny KPI sparkline; kept behind this adapter
 *    because replacing it adds no visual or functional value).
 *  - BaseTimeSeriesChart (rank history) → Unovis, via MetricTrendChart.
 *
 * Pages get typed props (`data`, `intent`, `variant`, `format`, `reversed`)
 * and never touch an engine API directly.
 */
import * as React from "react";
import { LineChart as LineChartIcon, AlertTriangle } from "lucide-react";
import { Sparkline } from "@/lib/dashboard-shared";
import {
  seriesColor,
  formatNumber,
  formatCompact,
  formatPercent,
  formatRank,
  type SharedSeriesIntent,
} from "./chart-config";
import { SHARED_CHART_STATE_COPY, SHARED_LEGEND_PRESET, CHART_PRESETS } from "./chart-presets";
import type { UnovisSeriesSpec } from "./charts-unovis";

/* ---------------- Lazy Unovis engine (browser only) ---------------- */

const UnovisLineChart = React.lazy(() => import("./charts-unovis"));

function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

/** Shared loading / empty frame used by every Unovis-backed adapter. */
function ChartFrame({
  height,
  state,
  className,
}: {
  height: number;
  state: "loading" | "empty";
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ height, width: "100%" }}
      role="status"
      aria-live="polite"
      aria-busy={state === "loading"}
    >
      {state === "loading" ? (
        <div className="flex h-full w-full flex-col justify-end gap-2 rounded-md p-2">
          <div className="h-full w-full animate-pulse rounded-md bg-[color:var(--muted)]/60" />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-2 flex-1 animate-pulse rounded bg-[color:var(--muted)]/50"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md text-[11px] text-muted-foreground">
          <LineChartIcon className="h-5 w-5 opacity-60" aria-hidden="true" />
          <span>{SHARED_CHART_STATE_COPY.empty}</span>
        </div>
      )}
    </div>
  );
}

/** Shared error frame with an optional retry affordance. */
export function ChartErrorState({
  height = CHART_PRESETS.metricTrend.height,
  message,
  onRetry,
  className,
}: {
  height?: number;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={className} style={{ height, width: "100%" }} role="alert" aria-live="assertive">
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <AlertTriangle className="h-5 w-5 text-[color:var(--danger)]" aria-hidden="true" />
        <span>{message ?? SHARED_CHART_STATE_COPY.error}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 rounded-md border border-[color:var(--border)] px-2 py-1 text-[11px] text-foreground hover:bg-[color-mix(in_oklab,var(--muted)_40%,transparent)]"
          >
            Tekrar Dene
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- SharedSparkline (Recharts) ---------------- */

export interface SharedSparklineProps {
  /** Numeric series to plot; index-based X axis. */
  data: number[];
  /** Semantic color intent; resolved via chart-config. */
  intent?: SharedSeriesIntent;
  /** Escape hatch: explicit CSS color. Overrides `intent`. */
  color?: string;
  /**
   * Reverse the Y axis. Use `variant="rank"` when possible instead —
   * kept for backward compatibility with existing call sites.
   */
  reversed?: boolean;
  /** Semantic variant. `"rank"` implies reversed Y axis. */
  variant?: "value" | "rank";
  className?: string;
}

/** Tiny trend line for KPI cards / rows (Recharts, preset `kpiSparkline`). */
export function SharedSparkline({
  data,
  intent,
  color,
  reversed,
  variant = "value",
  className,
}: SharedSparklineProps) {
  const resolvedColor = color ?? seriesColor(intent ?? "primary");
  const reverseY = reversed ?? variant === "rank";
  return (
    <div className={className} style={{ minHeight: CHART_PRESETS.kpiSparkline.height }}>
      <Sparkline data={data} color={resolvedColor} reversed={reverseY} />
    </div>
  );
}

/* ---------------- Formatting ---------------- */

export type MetricFormatKind = "number" | "compact" | "percent" | "rank" | "currency";

function formatValue(v: number, kind: MetricFormatKind = "number"): string {
  switch (kind) {
    case "compact":
      return formatCompact(v);
    case "percent":
      return formatPercent(v);
    case "rank":
      return formatRank(v);
    case "currency":
      return `${formatNumber(v, 0)} ₺`;
    case "number":
    default:
      return formatNumber(v, 0);
  }
}

/* ---------------- Accessible legend ---------------- */

function ChartLegend({ series }: { series: UnovisSeriesSpec[] }) {
  return (
    <ul
      className="mt-2 flex flex-wrap items-center px-1 text-[11px] text-muted-foreground"
      style={{ gap: SHARED_LEGEND_PRESET.gap }}
      aria-label="Grafik serileri"
    >
      {series.map((s) => (
        <li key={s.id} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block rounded-full"
            style={{
              width: SHARED_LEGEND_PRESET.markerWidth,
              height: SHARED_LEGEND_PRESET.markerHeight,
              background: s.color,
            }}
          />
          <span>{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- MetricTrendChart ---------------- */

export interface MetricTrendPoint {
  label: string;
  value: number;
}

export interface MetricTrendChartProps {
  data: MetricTrendPoint[];
  /** Legend / tooltip series label. */
  seriesLabel: string;
  /** Semantic color intent — resolved via chart-config. */
  intent?: SharedSeriesIntent;
  color?: string;
  /** Reverse Y axis (rank charts). */
  reversed?: boolean;
  /** Value formatting semantics. */
  format?: MetricFormatKind;
  /** Height in px — defaults to the `metricTrend` preset. */
  height?: number;
  /** Kept for API compatibility; Unovis derives tick count automatically. */
  tickInterval?: number;
  /** Render a soft area under the line. */
  showArea?: boolean;
  /** Event annotations (diamond glyphs) by datum index. */
  markers?: { index: number; label?: string }[];
  /** Extra tooltip rows rendered under the value row. */
  tooltipExtra?: (index: number) => string;
  className?: string;
}

/** Full-width KPI / metric trend chart (Unovis, preset `metricTrend`). */
export function MetricTrendChart({
  data,
  seriesLabel,
  intent,
  color,
  reversed = false,
  format = "number",
  height = CHART_PRESETS.metricTrend.height,
  showArea = true,
  markers,
  tooltipExtra,
  className,
}: MetricTrendChartProps) {
  const mounted = useMounted();
  const resolvedColor = color ?? seriesColor(intent ?? "primary");
  const series = React.useMemo<UnovisSeriesSpec[]>(
    () => [{ id: "value", label: seriesLabel, color: resolvedColor, strokeWidth: 2 }],
    [seriesLabel, resolvedColor],
  );

  if (!data.length) return <ChartFrame height={height} state="empty" className={className} />;
  if (!mounted) return <ChartFrame height={height} state="loading" className={className} />;

  return (
    <div className={className}>
      <React.Suspense fallback={<ChartFrame height={height} state="loading" />}>
        <UnovisLineChart
          labels={data.map((d) => d.label)}
          values={data.map((d) => ({ value: d.value }))}
          series={series}
          height={height}
          reversed={reversed}
          formatValue={(v) => formatValue(v, format)}
          numXTicks={CHART_PRESETS.metricTrend.numXTicks}
          valueMin={format === "rank" ? 1 : undefined}
          integerTicks={format === "rank"}
          showArea={showArea}
          markers={markers}
          tooltipExtra={tooltipExtra}
        />
      </React.Suspense>
    </div>
  );
}

/* ---------------- MiniRankChart ---------------- */

export interface MiniRankPoint {
  v: number;
  label?: string;
}

export interface MiniRankChartProps {
  data: MiniRankPoint[];
  intent?: SharedSeriesIntent;
  color?: string;
  /** Height in px — defaults to 80. */
  height?: number;
  className?: string;
}

/**
 * Compact rank preview used inside side-panels / detail views (Unovis).
 * Rank 1 stays at the top; larger rank values render lower.
 */
export function MiniRankChart({ data, intent, color, height = 80, className }: MiniRankChartProps) {
  const mounted = useMounted();
  const resolvedColor = color ?? seriesColor(intent ?? "primary");
  const series = React.useMemo<UnovisSeriesSpec[]>(
    () => [{ id: "v", label: "Sıra", color: resolvedColor, strokeWidth: 1.5 }],
    [resolvedColor],
  );

  if (!data.length) return <ChartFrame height={height} state="empty" className={className} />;
  if (!mounted) return <ChartFrame height={height} state="loading" className={className} />;

  return (
    <div className={className}>
      <React.Suspense fallback={<ChartFrame height={height} state="loading" />}>
        <UnovisLineChart
          labels={data.map((d, i) => d.label ?? String(i + 1))}
          values={data.map((d) => ({ v: d.v }))}
          series={series}
          height={height}
          reversed
          valueMin={1}
          integerTicks
          formatValue={(v) => formatRank(v)}
          showXAxis={false}
          showYAxis={false}
        />
      </React.Suspense>
    </div>
  );
}

/* ---------------- MultiSeriesTrendChart ---------------- */

export interface MultiSeriesTrendPoint {
  label: string;
  /** Numeric value per series id — extra keys are ignored by chart config. */
  [seriesId: string]: number | string;
}

export interface MultiSeriesTrendSeries {
  id: string;
  label: string;
  intent?: SharedSeriesIntent;
  color?: string;
  dashed?: boolean;
  strokeWidth?: number;
}

export interface MultiSeriesTrendChartProps {
  data: MultiSeriesTrendPoint[];
  series: MultiSeriesTrendSeries[];
  format?: MetricFormatKind;
  height?: number;
  reversed?: boolean;
  tickInterval?: number;
  showLegend?: boolean;
  className?: string;
}

/**
 * Multi-series line chart — competitor / peer benchmark comparisons
 * (Unovis, preset `comparison`).
 */
export function MultiSeriesTrendChart({
  data,
  series,
  format = "number",
  height = CHART_PRESETS.comparison.height,
  reversed = false,
  showLegend = true,
  className,
}: MultiSeriesTrendChartProps) {
  const mounted = useMounted();
  const specs = React.useMemo<UnovisSeriesSpec[]>(
    () =>
      series.map((s) => ({
        id: s.id,
        label: s.label,
        color: s.color ?? seriesColor(s.intent ?? "primary"),
        dashed: s.dashed,
        strokeWidth: s.strokeWidth ?? 2,
      })),
    [series],
  );

  if (!data.length) return <ChartFrame height={height} state="empty" className={className} />;
  if (!mounted) return <ChartFrame height={height} state="loading" className={className} />;

  return (
    <div className={className}>
      <React.Suspense fallback={<ChartFrame height={height} state="loading" />}>
        <UnovisLineChart
          labels={data.map((d) => String(d.label))}
          values={data.map((d) => {
            const row: Record<string, number> = {};
            for (const s of specs) row[s.id] = Number(d[s.id]);
            return row;
          })}
          series={specs}
          height={height}
          reversed={reversed}
          formatValue={(v) => formatValue(v, format)}
          valueMin={format === "rank" ? 1 : undefined}
          integerTicks={format === "rank"}
          numXTicks={CHART_PRESETS.comparison.numXTicks}
        />
      </React.Suspense>
      {showLegend && <ChartLegend series={specs} />}
    </div>
  );
}

/* ---------------- Standard preset adapters (all Unovis) ---------------- */

const UnovisCategoricalChart = React.lazy(() => import("./charts-unovis-categorical"));

type StandardXYProps = Omit<MetricTrendChartProps, "showArea" | "height"> & { height?: number };

/** Standard time-series line chart (Unovis, preset `standardLine`). */
export function StandardLineChart({ height, ...props }: StandardXYProps) {
  return (
    <MetricTrendChart
      {...props}
      showArea={false}
      height={height ?? CHART_PRESETS.standardLine.height}
    />
  );
}

/** Standard area chart (Unovis, preset `standardArea`). */
export function StandardAreaChart({ height, ...props }: StandardXYProps) {
  return (
    <MetricTrendChart {...props} showArea height={height ?? CHART_PRESETS.standardArea.height} />
  );
}

/** Visibility trend over time (Unovis, preset `visibility`). */
export function VisibilityTrendChart(props: MultiSeriesTrendChartProps) {
  return (
    <MultiSeriesTrendChart {...props} height={props.height ?? CHART_PRESETS.visibility.height} />
  );
}

/** Multi-keyword rank comparison (Unovis, preset `comparison`, rank semantics). */
export function KeywordComparisonChart(props: MultiSeriesTrendChartProps) {
  return (
    <MultiSeriesTrendChart
      {...props}
      format={props.format ?? "rank"}
      reversed={props.reversed ?? true}
      height={props.height ?? CHART_PRESETS.comparison.height}
    />
  );
}

export interface StandardCategoryPoint {
  label: string;
  value: number;
}

/** Standard bar chart over categories (Unovis, preset `standardBar`). */
export function StandardBarChart({
  data,
  seriesLabel,
  intent,
  color,
  format = "number",
  height = CHART_PRESETS.standardBar.height,
  className,
}: {
  data: StandardCategoryPoint[];
  seriesLabel: string;
  intent?: SharedSeriesIntent;
  color?: string;
  format?: MetricFormatKind;
  height?: number;
  className?: string;
}) {
  const mounted = useMounted();
  const resolvedColor = color ?? seriesColor(intent ?? "primary");
  const series = React.useMemo<UnovisSeriesSpec[]>(
    () => [{ id: "value", label: seriesLabel, color: resolvedColor }],
    [seriesLabel, resolvedColor],
  );
  if (!data.length) return <ChartFrame height={height} state="empty" className={className} />;
  if (!mounted) return <ChartFrame height={height} state="loading" className={className} />;
  return (
    <div className={className}>
      <React.Suspense fallback={<ChartFrame height={height} state="loading" />}>
        <UnovisCategoricalChart
          kind="bar"
          labels={data.map((d) => d.label)}
          values={data.map((d) => ({ value: d.value }))}
          series={series}
          height={height}
          formatValue={(v) => formatValue(v, format)}
          numXTicks={CHART_PRESETS.standardBar.numXTicks}
        />
      </React.Suspense>
    </div>
  );
}

export interface StandardScatterPoint {
  x: number;
  y: number;
  size?: number;
}

/** Standard scatter plot (Unovis, preset `standardScatter`). */
export function StandardScatterChart({
  data,
  seriesLabel,
  intent,
  color,
  format = "number",
  formatX,
  height = CHART_PRESETS.standardScatter.height,
  className,
}: {
  data: StandardScatterPoint[];
  seriesLabel: string;
  intent?: SharedSeriesIntent;
  color?: string;
  format?: MetricFormatKind;
  formatX?: (v: number) => string;
  height?: number;
  className?: string;
}) {
  const mounted = useMounted();
  const resolvedColor = color ?? seriesColor(intent ?? "primary");
  const series = React.useMemo<UnovisSeriesSpec[]>(
    () => [{ id: "y", label: seriesLabel, color: resolvedColor }],
    [seriesLabel, resolvedColor],
  );
  if (!data.length) return <ChartFrame height={height} state="empty" className={className} />;
  if (!mounted) return <ChartFrame height={height} state="loading" className={className} />;
  return (
    <div className={className}>
      <React.Suspense fallback={<ChartFrame height={height} state="loading" />}>
        <UnovisCategoricalChart
          kind="scatter"
          labels={data.map((d) => String(d.x))}
          values={data.map((d) => ({ x: d.x, y: d.y, size: d.size ?? 8 }))}
          series={series}
          height={height}
          formatValue={(v) => formatValue(v, format)}
          formatX={formatX}
          sizeKey="size"
        />
      </React.Suspense>
    </div>
  );
}
