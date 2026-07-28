/**
 * BaseTimeSeriesChart — neutral, engine-agnostic rank-history adapter.
 *
 * Pages consume this component through the shared surface and never touch
 * the chart engine, its option shape, or `sonar-charts` internals.
 */
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHART_PRESETS } from "./chart-presets";
import { MetricTrendChart } from "./charts";
import {
  eventsInRange,
  formatTrDate,
  summarizeRange,
  type KeywordHistory,
  type RangeDays,
} from "@/lib/sonar-charts/keyword-history";

/**
 * Neutral, implementation-agnostic props for the shared time-series chart.
 * Deliberately does NOT extend or reuse any chart-engine type.
 */
export interface BaseTimeSeriesChartProps {
  /** Rank-history dataset (shared neutral data type). */
  history: KeywordHistory;
  /** Default visible range in days. */
  defaultRange?: RangeDays;
  /** Desktop chart height in px. Mobile shrinks automatically. */
  desktopHeight?: number;
  className?: string;
}

const RANGE_OPTIONS: RangeDays[] = [7, 30, 90];

function formatRankValue(value: number | null): string {
  return value == null ? "Top 200 içinde bulunamadı" : `#${value}`;
}

function formatDelta(value: number | null): string {
  if (value == null) return "—";
  if (value === 0) return "Stabil";
  return `${value > 0 ? "↑" : "↓"} ${Math.abs(value)} sıra`;
}

function formatDeltaArrow(value: number | null): string {
  return formatDelta(value);
}

/** Shared rank-history chart adapter backed by the Unovis shared chart layer. */
export function BaseTimeSeriesChart({
  history,
  defaultRange,
  desktopHeight,
  className,
}: BaseTimeSeriesChartProps) {
  const [range, setRange] = React.useState<RangeDays>(defaultRange ?? 30);
  const summary = React.useMemo(() => summarizeRange(history, range), [history, range]);
  const events = React.useMemo(
    () => eventsInRange(history, summary.points).slice(-3),
    [history, summary.points],
  );
  const height = desktopHeight ?? CHART_PRESETS.rankHistory.height;
  const allEvents = React.useMemo(
    () => eventsInRange(history, summary.points),
    [history, summary.points],
  );
  const eventByDate = React.useMemo(
    () => new Map(allEvents.map((event) => [event.date, event])),
    [allEvents],
  );
  const markerIndexes = React.useMemo(
    () =>
      summary.points
        .map((point, index) => (eventByDate.has(point.date) ? { index } : null))
        .filter((m): m is { index: number } => m !== null),
    [summary.points, eventByDate],
  );

  return (
    <div className={cn("rounded-lg border border-hairline bg-surface/35 p-4", className)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-editorial text-sm font-semibold">{range} Günlük Sıralama</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {summary.fromDate && summary.toDate
              ? `${formatTrDate(summary.fromDate)} – ${formatTrDate(summary.toDate)}`
              : "Sıralama geçmişi"}
          </div>
        </div>
        <div className="flex rounded-md border border-hairline bg-background/60 p-0.5">
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setRange(option)}
              className={cn(
                "h-7 px-2 text-[11px]",
                option === range && "bg-surface-2 text-foreground shadow-sm",
              )}
            >
              {option}G
            </Button>
          ))}
        </div>
      </div>

      <MetricTrendChart
        data={summary.points.map((point) => ({
          label: point.date.slice(5),
          value: point.rank ?? Number.NaN,
        }))}
        seriesLabel={history.keyword}
        intent="primary"
        reversed={CHART_PRESETS.rankHistory.reversed}
        format="rank"
        height={height}
        markers={markerIndexes}
        tooltipExtra={(index) => {
          const point = summary.points[index];
          if (!point) return "";
          const event = eventByDate.get(point.date);
          const rows = [
            `<div class="sonar-tt-meta">7 Günlük: ${formatDeltaArrow(summary.sevenDayDelta)}</div>`,
            `<div class="sonar-tt-meta">30 Günlük: ${formatDeltaArrow(summary.thirtyDayDelta)}</div>`,
          ];
          if (event) rows.push(`<div class="sonar-tt-meta">◆ ${event.title}</div>`);
          return rows.join("");
        }}
      />

      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {(
          [
            ["Mevcut Sıra", formatRankValue(summary.currentRank), null],
            ["En İyi", formatRankValue(summary.bestRank), null],
            ["En Kötü", formatRankValue(summary.worstRank), null],
            ["7 Günlük", formatDelta(summary.sevenDayDelta), summary.sevenDayDelta],
            ["30 Günlük", formatDelta(summary.thirtyDayDelta), summary.thirtyDayDelta],
          ] as [string, string, number | null][]
        ).map(([label, value, delta]) => (
          <div key={label} className="rounded-md border border-hairline bg-background/40 p-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
            <div
              className={cn(
                "mt-1 font-editorial text-base font-semibold tabular-nums",
                delta != null &&
                  (delta > 0
                    ? "text-[color:var(--success)]"
                    : delta < 0
                      ? "text-[color:var(--danger)]"
                      : "text-foreground"),
              )}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {events.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-hairline/70 pt-3">
          {events.map((event) => (
            <div key={`${event.date}-${event.title}`} className="flex gap-2 text-xs">
              <div className="w-16 shrink-0 text-muted-foreground">{formatTrDate(event.date)}</div>
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-muted-foreground">{event.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
