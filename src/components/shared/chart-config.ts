/**
 * Centralized chart configuration for the shared chart layer.
 *
 * All chart adapters (Recharts today, potentially Unovis/Tremor later)
 * consume tokens and helpers from this module. Pages never import chart
 * theme values directly — they only supply data + limited semantics
 * (color intent, rank vs value axis, format kind).
 */
import { readSonarChartTokens, type SonarChartTokens } from "@/lib/sonar-charts/tokens";

/* ---------------- Theme ---------------- */

export type SharedChartTheme = SonarChartTokens;

/** Live read of chart theme from CSS variables — theme-reactive. */
export function readSharedChartTheme(): SharedChartTheme {
  return readSonarChartTokens();
}

/* ---------------- Series colors ---------------- */

/**
 * Semantic series palette — shared by every chart adapter.
 * Fixed hues (not engine defaults) so multi-series charts stay legible in
 * both themes; neutral/ghost stays token-driven.
 */
export const SHARED_SERIES_COLORS = {
  primary: "var(--chart-series-1)",
  secondary: "var(--chart-series-2)",
  positive: "var(--chart-series-3)",
  accent: "var(--chart-series-4)",
  negative: "var(--chart-series-5)",
  neutral: "color-mix(in oklab, var(--muted-foreground) 50%, transparent)",
} as const;

/** Ordered palette for multi-series charts. */
export const SHARED_SERIES_SEQUENCE = [
  SHARED_SERIES_COLORS.primary,
  SHARED_SERIES_COLORS.secondary,
  SHARED_SERIES_COLORS.positive,
  SHARED_SERIES_COLORS.accent,
  SHARED_SERIES_COLORS.negative,
] as const;

/** Non-series chart chrome tokens (grid, axis, crosshair). */
export const SHARED_CHART_CHROME = {
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  crosshair: "var(--chart-crosshair)",
} as const;

export type SharedSeriesIntent = keyof typeof SHARED_SERIES_COLORS;

export function seriesColor(intent: SharedSeriesIntent = "primary"): string {
  return SHARED_SERIES_COLORS[intent];
}

/* ---------------- Presets (single source of truth) ----------------
 * Animation, axis, grid, tooltip, legend and state copy now live in
 * ./chart-presets and are re-exported here for backward compatibility.
 */
export {
  SHARED_CHART_ANIMATION,
  SHARED_AXIS_PRESET,
  SHARED_AXIS_PRESET as SHARED_AXIS_STYLE,
  SHARED_GRID_PRESET,
  SHARED_GRID_PRESET as SHARED_GRID_STYLE,
  SHARED_TOOLTIP_PRESET,
  SHARED_TOOLTIP_PRESET as SHARED_TOOLTIP_STYLE,
  SHARED_LEGEND_PRESET,
  SHARED_CHART_STATE_COPY,
  SHARED_CHART_STATE_COPY as SHARED_CHART_STATES,
  CHART_PRESETS,
} from "./chart-presets";

/* ---------------- Number & date formatters (TR locale) ---------------- */

const TR = "tr-TR";

export function formatNumber(v: number, digits = 0): string {
  return new Intl.NumberFormat(TR, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);
}

export function formatCompact(v: number): string {
  return new Intl.NumberFormat(TR, { notation: "compact", maximumFractionDigits: 1 }).format(v);
}

export function formatPercent(v: number, digits = 1): string {
  return `%${formatNumber(v, digits)}`;
}

export function formatRank(v: number): string {
  return `#${Math.round(v)}`;
}

export function formatDateShort(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(TR, { day: "2-digit", month: "short" }).format(date);
}

/* ---------------- Rank axis semantics ---------------- */

/**
 * Rank charts invert the Y axis so "up" means "better rank".
 * Rank bands are the standard visibility tiers used across the app.
 */
export const SHARED_RANK_AXIS = {
  /** Recharts / ECharts axis reversal. Consumers pass this to their axis. */
  reversed: true as const,
};

export const SHARED_RANK_BANDS: {
  label: string;
  min: number;
  max: number;
  tone: SharedSeriesIntent;
}[] = [
  { label: "İlk 3", min: 1, max: 3, tone: "positive" },
  { label: "İlk 10", min: 4, max: 10, tone: "primary" },
  { label: "İlk 50", min: 11, max: 50, tone: "accent" },
  { label: "İlk 200", min: 51, max: 200, tone: "neutral" },
];
