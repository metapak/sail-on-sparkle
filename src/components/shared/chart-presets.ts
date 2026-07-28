/**
 * Centralized visual presets for the shared chart layer.
 *
 * Axis, grid, tooltip, legend, rank-band, loading, empty and error presets
 * live here so every chart adapter (Unovis primary, Recharts sparkline)
 * renders one consistent, theme-reactive language.
 * Pages never import this file — they consume adapters.
 */

export const SHARED_AXIS_PRESET = {
  tickFontSize: 11,
  tickColor: "color-mix(in oklab, var(--foreground) 52%, transparent)",
  labelColor: "color-mix(in oklab, var(--foreground) 65%, transparent)",
  showDomainLine: false,
  showTickLine: false,
};

export const SHARED_GRID_PRESET = {
  stroke: "color-mix(in oklab, var(--border) 40%, transparent)",
  strokeDasharray: "0",
  crosshairStroke: "color-mix(in oklab, var(--foreground) 22%, transparent)",
};

export const SHARED_TOOLTIP_PRESET = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  padding: "8px 10px",
};

export const SHARED_LEGEND_PRESET = {
  markerWidth: 8,
  markerHeight: 8,
  gap: 12,
  fontSize: 11,
};

export const SHARED_CHART_ANIMATION = {
  /** Calm, short transitions. */
  enabled: true,
  duration: 400,
};

/** Named chart presets referenced by adapters. */
export const CHART_PRESETS = {
  rankHistory: { height: 300, reversed: true, numXTicks: 6, engine: "unovis" as const },
  visibility: { height: 280, reversed: false, numXTicks: 6, engine: "unovis" as const },
  comparison: { height: 280, reversed: false, numXTicks: 6, engine: "unovis" as const },
  metricTrend: { height: 256, reversed: false, numXTicks: 6, engine: "unovis" as const },
  standardLine: { height: 260, reversed: false, numXTicks: 6, engine: "unovis" as const },
  standardArea: { height: 260, reversed: false, numXTicks: 6, engine: "unovis" as const },
  standardBar: { height: 260, numXTicks: 8, engine: "unovis" as const },
  standardScatter: { height: 280, numXTicks: 6, engine: "unovis" as const },
  kpiSparkline: { height: 40, engine: "recharts" as const },
} as const;

export const SHARED_CHART_STATE_COPY = {
  loading: "Grafik yükleniyor…",
  empty: "Henüz yeterli veri yok",
  error: "Grafik yüklenemedi.",
};
