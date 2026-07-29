/**
 * ChartCard — the single analytical card shell for every chart in the app.
 *
 * Composition follows the Tremor Raw analytical-card pattern (eyebrow →
 * headline value → delta → controls → chart body → footnote) but is rendered
 * entirely with this project's shadcn/Tailwind primitives and semantic
 * tokens. No Tremor palette, spacing scale or typography is introduced.
 *
 * Pages pass content and state only; padding, header rhythm, state heights
 * and theming live here.
 */
import * as React from "react";
import { TrendingUp, TrendingDown, Minus, LineChart as LineChartIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricInfoTip } from "./metric-header";
import { getMetricDefinition } from "./metric-definitions";
import { SHARED_CHART_STATE_COPY } from "./chart-presets";
import { ChartErrorState } from "./charts";

/* ---------------- TrendIndicator ---------------- */

export interface TrendIndicatorProps {
  /** Formatted delta text, e.g. "+%21" or "-3 sıra". */
  value: React.ReactNode;
  direction?: "up" | "down" | "neutral";
  /**
   * Semantics of a rising value. For rank metrics an increase is bad, so pass
   * `"negative"` to flip the color mapping without changing the arrow.
   */
  polarity?: "positive" | "negative";
  className?: string;
}

/** Shared delta chip used by MetricCard and ChartCard headers. */
export function TrendIndicator({
  value,
  direction = "neutral",
  polarity = "positive",
  className,
}: TrendIndicatorProps) {
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const good = direction === "neutral" ? null : (direction === "up") === (polarity === "positive");
  const tone =
    good === null
      ? "text-muted-foreground bg-[color-mix(in_oklab,var(--muted)_45%,transparent)]"
      : good
        ? "text-[color:var(--success)] bg-[color:var(--success)]/10"
        : "text-[color:var(--danger)] bg-[color:var(--danger)]/10";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
        tone,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {value}
    </span>
  );
}

/* ---------------- AnalyticalEmptyState ---------------- */

export function AnalyticalEmptyState({
  height = 240,
  title = SHARED_CHART_STATE_COPY.empty,
  description,
  className,
}: {
  height?: number;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-md text-center",
        className,
      )}
      style={{ minHeight: height }}
      role="status"
    >
      <LineChartIcon className="h-5 w-5 text-muted-foreground opacity-60" aria-hidden="true" />
      <span className="text-xs text-muted-foreground">{title}</span>
      {description && (
        <span className="max-w-[36ch] text-[11px] text-muted-foreground/80">{description}</span>
      )}
    </div>
  );
}

/* ---------------- ChartCardHeader ---------------- */

export interface ChartCardHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Metric key from the central dictionary → renders the shared info tip. */
  metricKey?: string;
  /** Headline value rendered next to the title block. */
  value?: React.ReactNode;
  delta?: React.ReactNode;
  deltaDirection?: "up" | "down" | "neutral";
  deltaPolarity?: "positive" | "negative";
  /** Date-range label, e.g. "Son 30 gün". */
  dateRange?: string;
  /** Range switchers, metric toggles, export buttons… */
  actions?: React.ReactNode;
  className?: string;
}

export function ChartCardHeader({
  eyebrow,
  title,
  description,
  metricKey,
  value,
  delta,
  deltaDirection = "neutral",
  deltaPolarity = "positive",
  dateRange,
  actions,
  className,
}: ChartCardHeaderProps) {
  const def = metricKey ? getMetricDefinition(metricKey) : undefined;
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <div className="flex items-center gap-1.5">
          <h3 className="type-section-title truncate font-editorial text-sm font-semibold tracking-tight">
            {title}
          </h3>
          {def && <MetricInfoTip label={def.label} text={def.tooltip} />}
        </div>
        {(value || delta) && (
          <div className="mt-1 flex items-baseline gap-2">
            {value && (
              <div className="font-editorial text-2xl font-semibold tracking-tight tabular-nums">
                {value}
              </div>
            )}
            {delta && (
              <TrendIndicator value={delta} direction={deltaDirection} polarity={deltaPolarity} />
            )}
          </div>
        )}
        {(description || dateRange) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {[description, dateRange].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------- ChartCard ---------------- */

export interface ChartCardProps extends ChartCardHeaderProps {
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  /** State-frame height; should match the chart preset height. */
  height?: number;
  /** Footnote / legend slot rendered under the chart body. */
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Single analytical card shell: header + state handling + chart body.
 * Every chart surface in the dashboard uses this — there is no
 * Overview/Keywords/Competitor specific card system.
 */
export function ChartCard({
  children,
  isLoading,
  isEmpty,
  isError,
  errorMessage,
  onRetry,
  height = 280,
  footer,
  className,
  bodyClassName,
  ...header
}: ChartCardProps) {
  let body: React.ReactNode;
  if (isError) {
    body = <ChartErrorState height={height} message={errorMessage} onRetry={onRetry} />;
  } else if (isLoading) {
    body = (
      <div
        className="w-full animate-pulse rounded-md bg-[color:var(--muted)]/50"
        style={{ height }}
        role="status"
        aria-busy="true"
        aria-label={SHARED_CHART_STATE_COPY.loading}
      />
    );
  } else if (isEmpty) {
    body = <AnalyticalEmptyState height={height} />;
  } else {
    body = children;
  }

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-hairline bg-card/70 p-4 sm:p-5",
        className,
      )}
    >
      <ChartCardHeader {...header} />
      <div className={cn("mt-4", bodyClassName)}>{body}</div>
      {footer && <div className="mt-3 text-[11px] text-muted-foreground">{footer}</div>}
    </section>
  );
}

/* ---------------- MetricCardGroup ---------------- */

/** Responsive KPI row. Keeps card grid rhythm identical across workspaces. */
export function MetricCardGroup({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}) {
  const cols: Record<number, string> = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-5",
  };
  return <div className={cn("grid grid-cols-1 gap-3", cols[columns], className)}>{children}</div>;
}
