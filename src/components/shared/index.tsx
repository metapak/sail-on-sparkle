/**
 * Shared dashboard component layer.
 *
 * Thin aliases + composition wrappers over the existing Sonar foundation so
 * every analytical page can compose from ONE named surface. Changing a token
 * or a shared primitive updates every consumer.
 *
 * DO NOT duplicate table/chart/card systems on feature pages — import from
 * "@/components/shared" instead.
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Panel,
  SectionHead,
  DeltaPill,
  Sparkline,
  ChangeCell,
  STATUS_TONE,
  type OpportunityStatus,
} from "@/lib/dashboard-shared";

/* ============================================================
 * Shared UI API — the single import surface for feature pages.
 *
 * Feature/page files MUST import visual components from
 * "@/components/shared" only. Direct imports of SonarDataGrid,
 * sonar-charts, ECharts internals, or dashboard-shared visual
 * primitives are blocked at the ESLint layer.
 *
 * Adapters live here so internal implementations (table engine,
 * chart engine, tokens) can change without page rewrites.
 * ============================================================ */

/* ---------------- Table adapter layer ---------------- */
// `SharedDataTable` is a real typed adapter (see ./table). Pages consume it
// via the neutral `SharedDataTableProps<T>` surface. `SonarDataGrid` is
// re-exported for the shared/domain layer only.
export { SharedDataTable, type SharedDataTableProps } from "./table";

/* ---------------- Status / classification registry ---------------- */
import { StatusPill as SharedStatusPill } from "./status-definitions";
import { getMetricDefinition } from "./metric-definitions";
import { MetricInfoTip } from "./metric-header";
import { SharedSparkline } from "./charts";
import { TrendIndicator } from "./chart-card";
export {
  STATUS_DEFINITIONS,
  STATUS_EXPLAIN,
  StatusPill,
  INTERACTIVE_CONTROL,
  TOUCH_TARGET,
  useCoarsePointer,
  getStatusDefinition,
  statusLabel,
  statusDescription,
  type StatusDefinition,
} from "./status-definitions";
// ONE typed column contract — routes declare columns through these helpers.
export {
  defineColumn,
  defineColumnGroup,
  defineUtilityColumn,
  resolveColumnLabel,
  type SharedColumnSpec,
} from "./column-kit";
export { COLUMN_WIDTHS, type ColumnWidthRole } from "./table-presets";
export {
  useTablePreferences,
  type SharedTableId,
  type TablePreferences,
  type UseTablePreferences,
} from "./table-preferences";

export { SonarDataGrid } from "@/components/sonar-data-grid/SonarDataGrid";
export {
  DataGridToolbar,
  DataGridToolbar as DataTableToolbar,
  ToolbarSpacer,
  ToolbarSection,
} from "@/components/sonar-data-grid/DataGridToolbar";
export {
  DataGridPagination,
  DataGridPagination as DataTablePagination,
} from "@/components/sonar-data-grid/DataGridPagination";
export {
  DataGridColumnManager,
  DataGridColumnManager as DataTableColumnVisibility,
} from "@/components/sonar-data-grid/DataGridColumnManager";
export {
  DataGridDensitySelector,
  DataGridDensitySelector as DataTableDensitySelector,
} from "@/components/sonar-data-grid/DataGridDensitySelector";
export {
  DataGridLoadingState,
  DataGridLoadingState as DataTableLoadingState,
} from "@/components/sonar-data-grid/DataGridLoadingState";
export {
  DataGridEmptyState,
  DataGridEmptyState as DataTableEmptyState,
} from "@/components/sonar-data-grid/DataGridEmptyState";
export { DataGridBulkActionBar } from "@/components/sonar-data-grid/DataGridBulkActionBar";
export {
  DataGridSavedViews,
  DataGridSavedViews as DataTableSavedViews,
} from "@/components/sonar-data-grid/DataGridSavedViews";
export {
  DataFreshnessIndicator,
  DataFreshnessIndicator as DataFreshnessLabel,
  freshnessFromMinutes,
  type Freshness,
  type FreshnessKind,
} from "@/components/sonar-data-grid/DataFreshnessIndicator";

// Neutral shared types (structurally compatible with the internal engine).
export type { SharedDensity, SharedSavedView, SharedBulkAction, SharedColumnMeta } from "./types";
// Back-compat aliases so already-migrated pages keep compiling. Prefer the
// `Shared*` names above in new code — the raw `Sonar*`/`SavedView` types
// will move behind the adapter boundary in a future pass.
export type {
  Density,
  SavedView,
  SonarColumnMeta,
  ColumnDef,
  VisibilityState,
  SortingState,
  ColumnPinningState,
} from "@/components/sonar-data-grid/types";
export type { BulkAction } from "@/components/sonar-data-grid/DataGridBulkActionBar";
export {
  DENSITY_LABEL,
  DENSITY_ROW_CLASS,
  DENSITY_CELL_CLASS,
} from "@/components/sonar-data-grid/types";

/* ---------------- Metric header + metric dictionary ---------------- */
export { SharedMetricHeader, MetricInfoTip, type SharedMetricHeaderProps } from "./metric-header";
export {
  METRIC_DEFINITIONS,
  METRIC_ALIASES,
  getMetricDefinition,
  getMetricTooltip,
  type MetricDefinition,
} from "./metric-definitions";
export {
  DataGridColumnHeader,
  DataGridColumnHeader as DataTableMetricHeader,
} from "@/components/sonar-data-grid/DataGridColumnHeader";

/* ---------------- Shared comparison surface ---------------- */
export {
  SharedComparisonDialog,
  buildComparisonBulkAction,
  sharedBestIndex,
  SHARED_COMPARISON_MIN,
  SHARED_COMPARISON_MAX,
  type SharedCompareMetric,
  type SharedComparisonDialogProps,
  type SharedComparisonSummaryItem,
  type SharedComparisonChartSeries,
} from "./comparison";
export { buildKeywordCompareSeries, type KeywordCompareSeed } from "./keyword-compare";

/* ---------------- Central registries: design + layout + i18n ---------------- */
export {
  typography,
  typeClass,
  TYPOGRAPHY_SCALE,
  NUMERIC_CLASS,
  type TypographyRole,
  colorToken,
  shapeToken,
  motionToken,
  zLayer,
  zClass,
  type ZLayer,
  LAYOUT_PRESETS,
  layout,
  type LayoutPreset,
} from "@/design";
export {
  PageShell,
  MarketingPage,
  DashboardPage,
  WorkspacePage,
  SettingsPage,
  DetailPage,
  CardGrid,
} from "./layout";
export {
  LocaleProvider,
  useLocale,
  useT,
  LOCALES,
  LOCALE_DIR,
  LOCALE_LABEL,
  DEFAULT_LOCALE,
  type Locale,
} from "@/i18n";

/* ---------------- Central visual presets ---------------- */
export { TABLE_PRESETS, TABLE_SURFACE, TABLE_RESIZE, TABLE_STATE_COPY } from "./table-presets";

/* ---------------- Chart adapter layer ---------------- */
// Config-first: pages consume config helpers + typed adapters, never
// engine-specific chart types.
export * from "./chart-config";
export {
  SharedSparkline,
  MetricTrendChart,
  MiniRankChart,
  MultiSeriesTrendChart,
  type SharedSparklineProps,
  type MetricTrendChartProps,
  type MetricTrendPoint,
  type MiniRankChartProps,
  type MiniRankPoint,
  type MultiSeriesTrendChartProps,
  type MultiSeriesTrendPoint,
  type MultiSeriesTrendSeries,
  type MetricFormatKind,
  ChartErrorState,
  StandardLineChart,
  StandardAreaChart,
  StandardBarChart,
  StandardScatterChart,
  VisibilityTrendChart,
  KeywordComparisonChart,
  type StandardCategoryPoint,
  type StandardScatterPoint,
} from "./charts";

/* ---------------- Analytical card system (single source) ---------------- */
export {
  ChartCard,
  ChartCardHeader,
  TrendIndicator,
  AnalyticalEmptyState,
  MetricCardGroup,
  type ChartCardProps,
  type ChartCardHeaderProps,
  type TrendIndicatorProps,
} from "./chart-card";

// `BaseTimeSeriesChart` is the shared neutral time-series surface. It is a
// real wrapper (see ./rank-history) — pages consume only its neutral prop
// interface and never touch chart-engine internals or sonar-charts
// internals directly.
export { BaseTimeSeriesChart, type BaseTimeSeriesChartProps } from "./rank-history";
export { SonarChartContainer as BaseChartContainer } from "@/lib/sonar-charts/SonarChartContainer";
export { SonarChartEmptyState as ChartEmptyState } from "@/lib/sonar-charts/SonarChartEmptyState";
// Rank-history data helpers — kept behind the shared surface so pages don't
// reach into `@/lib/sonar-charts/*` directly.
export {
  getKeywordHistory,
  summarizeRange,
  sliceRange,
  eventsInRange,
  findRankBeforeDate,
  type RankPoint,
  type RankEvent,
  type KeywordHistory,
  type RangeDays,
  type RangeSummary,
} from "@/lib/sonar-charts/keyword-history";

/* ---------------- Design-token primitives ---------------- */
// Re-exports of the base visual primitives that used to live in
// @/lib/dashboard-shared. Pages import ONLY from @/components/shared.
export {
  Panel,
  SectionHead,
  DeltaPill,
  Sparkline,
  ChangeCell,
  ScoreBar,
  STATUS_TONE,
  ACTION_TONE,
  COVERAGE_TONE,
  rankLabel,
  coverageForKeyword,
  type OpportunityStatus,
  type ActionLabel,
  type Keyword,
} from "@/lib/dashboard-shared";

/* ---------------- Composition wrappers ---------------- */

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  /** Flip delta coloring for metrics where "up" is bad (rank, churn…). */
  deltaPolarity?: "positive" | "negative";
  note?: string;
  series?: number[];
  seriesColor?: string;
  seriesReversed?: boolean;
  /** Metric key from the central dictionary → shared info tooltip. */
  metricKey?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * The single KPI card in the app (Tremor-Raw-style composition, rendered with
 * this project's tokens). Overview, Keywords and Competitors all use it —
 * there is no second metric-card system.
 */
export function MetricCard({
  label,
  value,
  suffix,
  delta,
  trend = "neutral",
  deltaPolarity = "positive",
  note,
  series,
  seriesColor,
  seriesReversed,
  metricKey,
  isLoading,
  isEmpty,
  isError,
  errorMessage,
  onClick,
  className,
}: MetricCardProps) {
  const def = metricKey ? getMetricDefinition(metricKey) : undefined;
  const interactive = Boolean(onClick);
  const shell = cn(
    "flex min-h-[108px] w-full flex-col justify-between rounded-[var(--radius-lg)] border border-hairline bg-card/70 p-4 text-left",
    "shadow-none transition-colors hover:bg-card",
    interactive &&
      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]",
    className,
  );

  let body: React.ReactNode;
  if (isError) {
    body = (
      <div className="flex flex-1 items-center text-xs text-[color:var(--danger)]">
        {errorMessage ?? "Veri yüklenemedi."}
      </div>
    );
  } else if (isLoading) {
    body = (
      <div className="flex flex-1 flex-col justify-end gap-2" aria-busy="true">
        <div className="h-7 w-24 animate-pulse rounded bg-[color:var(--muted)]/60" />
        <div className="h-10 w-full animate-pulse rounded bg-[color:var(--muted)]/40" />
      </div>
    );
  } else if (isEmpty) {
    body = <div className="flex flex-1 items-center text-xs text-muted-foreground">Veri yok</div>;
  } else {
    body = (
      <>
        <div className="mt-2 flex items-end gap-1">
          <span className="type-kpi-value sonar-kpi-value">{value}</span>
          {suffix && <span className="type-body pb-0.5 text-muted-foreground">{suffix}</span>}
        </div>
        {series ? (
          <div className="mt-2 opacity-60">
            <SharedSparkline data={series} color={seriesColor} reversed={seriesReversed} />
          </div>
        ) : (
          <div className="h-10" />
        )}
        {note && <div className="type-caption mt-1 text-muted-foreground">{note}</div>}
      </>
    );
  }

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="type-kpi-label uppercase tracking-[0.05em] text-muted-foreground">
            {label}
          </span>
          {def && <MetricInfoTip label={def.label} text={def.tooltip} />}
        </div>
        {delta && !isLoading && !isError && (
          <TrendIndicator value={delta} direction={trend} polarity={deltaPolarity} />
        )}
      </div>
      {body}
    </>
  );

  return interactive ? (
    <button type="button" onClick={onClick} className={shell}>
      {content}
    </button>
  ) : (
    <div className={shell}>{content}</div>
  );
}

/* ---------------- Shared cell primitives ---------------- */
export { ScoreCell, RankCell, type ScoreCellProps } from "./cells";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/** Unified page header for every analytical route. */
export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="type-eyebrow mb-1 text-muted-foreground">{eyebrow}</div>}
        <h1 className="type-page-title">{title}</h1>
        {description && (
          <p className="type-body-compact mt-1 max-w-2xl text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// SectionHead re-exported above as part of the design-token primitives block.

/**
 * Restrained score badge for opportunity classifications.
 * Thin alias over the registry-backed `StatusPill` so label, tone and
 * explanation always come from `./status-definitions`.
 */
export function ScoreBadge({
  status,
  className,
}: {
  status: OpportunityStatus;
  className?: string;
}) {
  return <SharedStatusPill status={status} className={className} />;
}

/** Rank change indicator alias — positive = ranking improved. */
export function RankChangeIndicator({ change }: { change: number }) {
  return <ChangeCell change={change} />;
}

/** Filter bar shell — a horizontal toolbar for filter + control groups. */
export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-hairline bg-surface/40 px-3 py-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Shared segmented control (Phase 9) — one implementation for every
 * "pick one of N" inline switch (metric switchers, view modes, ranges).
 * Routes declare options and value; heights, radius, focus ring and the
 * selected treatment are defined here only.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
  className,
  ariaLabel,
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-wrap gap-1 rounded-lg border border-hairline bg-surface/50 p-1",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-md font-medium transition-[background-color,color] duration-[var(--duration-fast)]",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)]",
              size === "sm" ? "px-2.5 py-1 text-[11px]" : "h-8 px-3 text-xs",
              active
                ? "bg-primary/20 text-foreground ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Empty-state block for pages/sections (not tables — use DataTableEmptyState). */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-lg border border-hairline bg-surface/40 p-8 text-center", className)}
    >
      <div className="type-card-title">{title}</div>
      {description && (
        <p className="type-caption mx-auto mt-1 max-w-md text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}

/** Simple error-state block. */
export function ErrorState({
  title = "Bir sorun oluştu",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-lg border border-hairline bg-surface/40 p-8 text-center", className)}
    >
      <div className="type-card-title text-[color:var(--danger)]">{title}</div>
      {description && (
        <p className="type-caption mx-auto mt-1 max-w-md text-muted-foreground">{description}</p>
      )}
      {onRetry && (
        <div className="mt-3 flex justify-center">
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-hairline text-xs"
            onClick={onRetry}
          >
            Tekrar Dene
          </Button>
        </div>
      )}
    </div>
  );
}

/** Skeleton block — for non-table loading UIs. */
export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-2/60", className)} />;
}
