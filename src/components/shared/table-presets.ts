/**
 * Centralized visual presets for the shared table layer.
 *
 * Row height, cell padding, header height/typography, separators, hover and
 * selection treatments live here — never in route files. Changing a value
 * updates every migrated analytical table at once.
 */

export const TABLE_PRESETS: Record<
  "comfortable" | "standard" | "compact",
  { rowClass: string; cellClass: string; headerHeight: number }
> = {
  comfortable: {
    rowClass: "h-[60px]",
    cellClass: "px-5 py-0 type-table-cell",
    headerHeight: 44,
  },
  standard: {
    rowClass: "h-[48px]",
    cellClass: "px-4 py-0 type-table-cell",
    headerHeight: 44,
  },
  compact: {
    rowClass: "h-[36px]",
    cellClass: "px-3 py-0 type-table-cell",
    headerHeight: 44,
  },
};

/**
 * Central width contract. Every migrated column derives its `size`/`minSize`
 * from one of these roles — never from an ad-hoc number in a route file.
 */
/**
 * Manual resizing of business columns is bounded only by a safety minimum —
 * never by an arbitrary maximum. Only genuinely fixed utility columns
 * (selection, actions, spacer) declare a real `maxSize`.
 */
export const UNBOUNDED_COLUMN_MAX = Number.MAX_SAFE_INTEGER;

export const COLUMN_WIDTHS = {
  utility: { size: 40, minSize: 36, maxSize: 48 },
  actions: { size: 64, minSize: 56, maxSize: 96 },
  /** Primary descriptive column (keyword, app name…). */
  primary: { size: 320, minSize: 80, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Alias of `primary` — semantic layout role name. */
  primaryText: { size: 320, minSize: 80, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Dense analytical workspaces (competitor gap) start narrower. */
  primaryTextDense: { size: 280, minSize: 80, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Numeric metric column with a two-line header. */
  metric: { size: 96, minSize: 48, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Compact numeric column (rank, delta). */
  numeric: { size: 92, minSize: 48, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Own / best rank. */
  rank: { size: 88, minSize: 48, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Rank difference. */
  rankDelta: { size: 96, minSize: 48, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Dynamic competitor rank (icon + short name header). */
  competitorRank: { size: 124, minSize: 64, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Score-style 0–100 metric. */
  score: { size: 90, minSize: 48, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Status pill column. */
  status: { size: 120, minSize: 48, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Freshness indicator column. */
  freshness: { size: 112, minSize: 48, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Text column (group, status, source…). */
  text: { size: 150, minSize: 80, maxSize: UNBOUNDED_COLUMN_MAX },
  /** Chart/sparkline column. */
  chart: { size: 140, minSize: 48, maxSize: UNBOUNDED_COLUMN_MAX },
} as const;

export type ColumnWidthRole = keyof typeof COLUMN_WIDTHS;

/** Roles whose header AND cells are centered (numeric/semantic alignment). */
export const CENTERED_ROLES: ReadonlySet<string> = new Set([
  "utility",
  "actions",
  "metric",
  "numeric",
  "rank",
  "rankDelta",
  "competitorRank",
  "score",
  "status",
  "freshness",
]);

/** Shared table surface classes (header, separators, focus). */
export const TABLE_SURFACE = {
  header:
    "bg-[color:var(--table-header)] backdrop-blur-[6px] type-table-header uppercase tracking-[0.06em] text-muted-foreground",
  headerBorder: "border-b border-[color:var(--border)]",
  rowBorder: "border-b border-[color-mix(in_oklab,var(--border)_20%,transparent)]",
  rowHover: "hover:bg-[color:var(--table-row-hover)]",
  rowSelected: "bg-[color:var(--table-row-selected)] shadow-[inset_2px_0_0_0_var(--primary)]",
  stickyLeftSeparator: "shadow-[4px_0_6px_-4px_rgba(0,0,0,0.18)]",
  stickyRightSeparator: "shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.18)]",
  /** Full-height vertical column divider (header + body share the same rule). */
  columnDivider: "border-e border-[color:var(--table-column-divider)] last:border-e-0",
  /** Grouped (parent) header row. */
  groupHeader:
    "bg-[color:var(--table-header)] type-table-header uppercase tracking-[0.08em] text-muted-foreground/80",
  focusRing:
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[color:var(--focus-ring)]",
} as const;

/** Resize affordance geometry — shared by hover guide and active guide. */
export const TABLE_RESIZE = {
  /** Pointer hit area width in px (8–12px target, touch friendly). */
  hitWidth: 12,
  /** Visible guide width in px. */
  guideWidth: 2,
};

export const TABLE_STATE_COPY = {
  loading: "Veriler yükleniyor…",
  empty: "Sonuç bulunamadı.",
  error: "Tablo yüklenemedi.",
};

/* ---------------- Deterministic column layout model ---------------- */

/**
 * Layout role of a column, declared per preset (never inferred from an id
 * inside the grid engine).
 *
 * - `utility`   — checkbox / favorite / tracking / row menu / spacer. Fixed,
 *                 compact, never absorbs viewport space.
 * - `fixed-data`— analytical column that keeps its committed base width.
 * - `flex-data` — designated primary descriptive column. Only these columns
 *                 absorb the leftover viewport width, weighted by `flexWeight`.
 */
export type TableLayoutRole = "utility" | "fixed-data" | "flex-data";

export const TABLE_LAYOUT = {
  defaultRole: "fixed-data" as TableLayoutRole,
  defaultFlexWeight: 1,
};

/** Shorthand preset for a designated flexible primary data column. */
export const FLEX_DATA_COLUMN = (flexWeight = TABLE_LAYOUT.defaultFlexWeight) =>
  ({ layoutRole: "flex-data" as TableLayoutRole, flexWeight }) as const;

/** Shorthand preset for utility columns (selection, favorite, actions…). */
export const UTILITY_COLUMN = { layoutRole: "utility" as TableLayoutRole } as const;

/* ---------------- Responsive (container-aware) compact layout ---------------- */

/**
 * Compact table layout — driven by the MEASURED grid container width, never by
 * `window.innerWidth` or a device name.
 *
 * Threshold reason (from the mobile diagnostic): at 375–430 px the stored
 * desktop widths of the pinned identity block (select 40 + keyword up to
 * 342 + actions 64 ≈ 446 px) exceed the container, so every centre metric
 * column is covered by sticky layers. The widest phone-class container the
 * dashboard shell produces is ~406 px; a 640 px threshold also covers small
 * split panes and heavy browser zoom while leaving tablet/desktop untouched.
 */
export const COMPACT_LAYOUT = {
  /** Container width (px) below which the grid renders in compact mode. */
  containerBreakpoint: 640,
  /** Minimum unpinned centre strip: one full metric column + divider. */
  minCentreViewport: 120,
  /** Effective width ceilings per semantic column role (compact only). */
  caps: {
    selection: 40,
    action: 56,
    primary: 192,
    metric: 132,
  },
  /** Readability floors. */
  mins: {
    primary: 176,
    metric: 88,
  },
} as const;

/**
 * Derive a compact EFFECTIVE width from a column's canonical (stored/base)
 * width. The stored preference is never mutated — this value is transient and
 * disappears the moment the container grows back to regular width.
 */
export function compactEffectiveWidth(
  role: ColumnWidthRole | undefined,
  layoutRole: TableLayoutRole | undefined,
  baseWidth: number,
  minSize: number,
): number {
  const { caps, mins } = COMPACT_LAYOUT;
  let target: number;
  if (role === "utility" || (!role && layoutRole === "utility")) target = caps.selection;
  else if (role === "actions") target = caps.action;
  else if (role === "primary" || role === "primaryText" || role === "primaryTextDense")
    target = Math.max(mins.primary, Math.min(baseWidth, caps.primary));
  else if (layoutRole === "flex-data")
    target = Math.max(mins.primary, Math.min(baseWidth, caps.primary));
  else target = Math.max(Math.min(baseWidth, caps.metric), Math.min(baseWidth, mins.metric));
  return Math.max(minSize, Math.round(Math.min(baseWidth, target)));
}
