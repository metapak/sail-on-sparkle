/**
 * CENTRAL TOKEN REGISTRY (Phase 4)
 *
 * TypeScript mirror of the CSS custom properties declared in src/styles.css.
 * Components must reference tokens through these helpers instead of raw
 * colors, shadows, z-index numbers or durations.
 */

/** Semantic color token -> CSS var reference (usable in inline styles/SVG). */
export const colorToken = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  surface: "var(--surface)",
  surface2: "var(--surface-2)",
  card: "var(--card)",
  popover: "var(--popover)",
  elevated: "var(--elevated)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  border: "var(--border)",
  hairline: "var(--hairline)",

  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",

  hover: "var(--hover)",
  active: "var(--active)",
  selected: "var(--selected)",
  focusRing: "var(--focus-ring)",
  disabledForeground: "var(--disabled-foreground)",
  overlay: "var(--overlay)",

  chartSeries1: "var(--chart-series-1)",
  chartSeries2: "var(--chart-series-2)",
  chartSeries3: "var(--chart-series-3)",
  chartSeries4: "var(--chart-series-4)",
  chartSeries5: "var(--chart-series-5)",
  chartGrid: "var(--chart-grid)",
  chartAxis: "var(--chart-axis)",
  chartCrosshair: "var(--chart-crosshair)",
  chartTooltip: "var(--chart-tooltip)",
  chartPositive: "var(--chart-positive)",
  chartNegative: "var(--chart-negative)",

  tableHeader: "var(--table-header)",
  tableRowHover: "var(--table-row-hover)",
  tableRowSelected: "var(--table-row-selected)",
  tablePinned: "var(--table-pinned)",
  tableSeparator: "var(--table-separator)",
  tableScrollbar: "var(--table-scrollbar)",
} as const;

/** Shape + elevation. */
export const shapeToken = {
  radiusSm: "var(--radius-sm)",
  radius: "var(--radius)",
  radiusLg: "var(--radius-lg)",
  shadowSm: "var(--shadow-sm-token)",
  shadowMd: "var(--shadow-md-token)",
  shadowOverlay: "var(--shadow-overlay-token)",
} as const;

/** Motion. */
export const motionToken = {
  durationFast: "var(--duration-fast)",
  durationNormal: "var(--duration-normal)",
  easingStandard: "var(--easing-standard)",
} as const;

/**
 * Z-index scale. Overlay layers must use these tokens (or the matching
 * Tailwind arbitrary value below) — never ad-hoc numbers.
 */
export const zLayer = {
  stickyHeader: 30,
  pinnedColumn: 20,
  dropdown: 40,
  popover: 50,
  tooltip: 60,
  drawer: 70,
  dialog: 80,
  toast: 90,
} as const;

export type ZLayer = keyof typeof zLayer;

/** Tailwind class for a z-layer, e.g. zClass("dialog") -> "z-[80]". */
export function zClass(layer: ZLayer) {
  return `z-[${zLayer[layer]}]`;
}
