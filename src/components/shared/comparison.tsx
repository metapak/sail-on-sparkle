/**
 * Shared multi-row comparison surface.
 *
 * One reusable implementation for "select rows → Karşılaştır" on any
 * analytical table (Tracked Keywords, Research, future keyword tables).
 * Pages provide the selected records plus a metric descriptor list; the
 * dialog handles layout, best-value highlighting, summary cards, mobile
 * presentation, and the documented selection limits.
 */
import * as React from "react";
import { GitCompare, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { BulkAction } from "@/components/sonar-data-grid/DataGridBulkActionBar";
import { MultiSeriesTrendChart, type MultiSeriesTrendPoint } from "./charts";
import { SHARED_SERIES_SEQUENCE } from "./chart-config";

/** Documented product limits for selection-driven comparison. */
export const SHARED_COMPARISON_MIN = 2;
export const SHARED_COMPARISON_MAX = 5;

export interface SharedCompareMetric<T> {
  id: string;
  label: string;
  /** Numeric value used for best-value highlighting (null = not comparable). */
  value: (row: T) => number | null;
  render: (row: T) => React.ReactNode;
  higherBetter?: boolean;
  lowerBetter?: boolean;
}

export function sharedBestIndex<T>(rows: T[], metric: SharedCompareMetric<T>): number | null {
  const values = rows.map((r) => metric.value(r));
  const better = metric.higherBetter ? 1 : metric.lowerBetter ? -1 : 0;
  if (better === 0) return null;
  let best: number | null = null;
  let idx: number | null = null;
  values.forEach((v, i) => {
    if (v == null) return;
    if (best == null || (better === 1 ? v > best : v < best)) {
      best = v;
      idx = i;
    }
  });
  return idx;
}

export interface SharedComparisonSummaryItem {
  label: string;
  title: string;
  value: string;
  tone?: "cobalt" | "success" | "warning";
}

export interface SharedComparisonChartSeries<T> {
  id: string;
  label: string;
  row: T;
  /** Chronological observations. `date` (ISO yyyy-mm-dd) drives range filtering. */
  values: { label: string; value: number | null; date?: string }[];
}

export interface SharedComparisonDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: T[];
  metrics: SharedCompareMetric<T>[];
  idOf: (row: T) => string;
  titleOf: (row: T) => string;
  onRemove?: (id: string) => void;
  title?: string;
  description?: string;
  min?: number;
  max?: number;
  /** Optional derived summary highlights rendered above the matrix. */
  summary?: SharedComparisonSummaryItem[];
  /** Optional shared rank/time-series comparison chart. */
  chartSeries?: SharedComparisonChartSeries<T>[];
  /** Noun used in counters and empty-state copy. */
  itemNoun?: string;
  /** Chart section heading. */
  chartTitle?: string;
}

function SummaryTile({ label, title, value, tone = "cobalt" }: SharedComparisonSummaryItem) {
  const toneCls =
    tone === "success"
      ? "text-[color:var(--success)]"
      : tone === "warning"
        ? "text-[color:var(--warning)]"
        : "text-primary";
  return (
    <div className="rounded-md border border-hairline bg-surface/40 p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="truncate font-editorial text-sm font-semibold">{title}</span>
        <span className={cn("shrink-0 font-editorial text-sm font-semibold tabular-nums", toneCls)}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function SharedComparisonDialog<T>({
  open,
  onOpenChange,
  rows,
  metrics,
  idOf,
  titleOf,
  onRemove,
  title = "Anahtar Kelime Karşılaştırması",
  description = "Seçili kayıtların sinyallerini yan yana değerlendirin.",
  min = SHARED_COMPARISON_MIN,
  max = SHARED_COMPARISON_MAX,
  summary,
  chartSeries,
  itemNoun = "anahtar kelime",
  chartTitle = "Çoklu Anahtar Kelime Karşılaştırması",
}: SharedComparisonDialogProps<T>) {
  const [mobileIdx, setMobileIdx] = React.useState(0);
  React.useEffect(() => {
    if (mobileIdx >= rows.length) setMobileIdx(0);
  }, [rows.length, mobileIdx]);

  const insufficient = rows.length < min;
  const [range, setRange] = React.useState<7 | 30 | 90>(30);
  /**
   * Range filtering is date-driven: series are aligned on the union of their
   * observation dates and cut to the selected window, so 7G/30G/90G always
   * produce a different, correctly-labelled x axis even when series have
   * different lengths or gaps.
   */
  const chartData = React.useMemo<MultiSeriesTrendPoint[]>(() => {
    if (!chartSeries || chartSeries.length === 0) return [];
    const hasDates = chartSeries.every((s) => s.values.every((v) => typeof v.date === "string"));

    if (!hasDates) {
      const sliced = chartSeries.map((s) => ({ ...s, values: s.values.slice(-range) }));
      const labels = sliced[0]?.values.map((p) => p.label) ?? [];
      return labels.map((label, i) => {
        const point: MultiSeriesTrendPoint = { label };
        for (const s of sliced) {
          const value = s.values[i]?.value;
          point[s.id] = typeof value === "number" ? value : Number.NaN;
        }
        return point;
      });
    }

    const allDates = Array.from(
      new Set(chartSeries.flatMap((s) => s.values.map((v) => v.date as string))),
    ).sort();
    const windowDates = allDates.slice(-range);
    const byDate = new Map<string, Map<string, number | null>>();
    for (const s of chartSeries) {
      for (const v of s.values) {
        const key = v.date as string;
        if (!byDate.has(key)) byDate.set(key, new Map());
        byDate.get(key)!.set(s.id, v.value);
      }
    }
    return windowDates.map((date) => {
      const point: MultiSeriesTrendPoint = { label: date.slice(5) };
      const row = byDate.get(date);
      for (const s of chartSeries) {
        const value = row?.get(s.id);
        point[s.id] = typeof value === "number" ? value : Number.NaN;
      }
      return point;
    });
  }, [chartSeries, range]);

  /**
   * Missing-data clarity: classify every selected series against the active
   * chart window as complete / partial / missing. Chart input keeps complete
   * and partial series (with their real gaps) and drops missing ones.
   * No value is interpolated or substituted here.
   */
  const { drawnSeries, missingSeries, partialSeries, statusById } = React.useMemo(() => {
    const all = chartSeries ?? [];
    const expected = chartData.length;
    const status = new Map<string, "complete" | "partial" | "missing">();
    const drawn: SharedComparisonChartSeries<T>[] = [];
    const partial: SharedComparisonChartSeries<T>[] = [];
    const missing: SharedComparisonChartSeries<T>[] = [];
    for (const s of all) {
      const finite = chartData.reduce(
        (n, p) => (typeof p[s.id] === "number" && !Number.isNaN(p[s.id] as number) ? n + 1 : n),
        0,
      );
      const state = finite === 0 ? "missing" : finite < expected ? "partial" : "complete";
      status.set(s.id, state);
      if (state === "missing") missing.push(s);
      else {
        drawn.push(s);
        if (state === "partial") partial.push(s);
      }
    }
    return {
      drawnSeries: drawn,
      missingSeries: missing,
      partialSeries: partial,
      statusById: status,
    };
  }, [chartSeries, chartData]);

  /** Row id → history status, so the metric matrix can badge each column. */
  const statusByRowId = React.useMemo(() => {
    const map = new Map<string, "complete" | "partial" | "missing">();
    for (const s of chartSeries ?? []) {
      const state = statusById.get(s.id);
      if (state) map.set(idOf(s.row), state);
    }
    return map;
  }, [chartSeries, statusById, idOf]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none border-hairline bg-background p-0"
        style={{ width: "clamp(320px, 92vw, 1450px)", maxHeight: "85vh" }}
      >
        <div className="sticky top-0 z-10 border-b border-hairline bg-background px-6 py-4">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="font-editorial text-lg">{title}</DialogTitle>
                <DialogDescription className="text-xs">{description}</DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-hairline bg-surface/60 px-2 py-1 text-[11px] text-muted-foreground">
                  {rows.length} / {max} {itemNoun}
                </span>
                {/* Explicit close control: always visible, above sticky chrome. */}
                <DialogClose
                  aria-label="Karşılaştırmayı kapat"
                  className="grid h-8 w-8 place-items-center rounded-md border border-hairline bg-surface/60 text-muted-foreground transition hover:bg-surface-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--cobalt)]"
                >
                  <X className="h-4 w-4" />
                </DialogClose>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div
          className="sonar-scroll overflow-auto px-6 py-4"
          style={{ maxHeight: "calc(85vh - 90px)" }}
        >
          {insufficient ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-hairline bg-surface/40 py-14 text-center text-sm text-muted-foreground">
              <GitCompare className="h-6 w-6 opacity-60" />
              <div>Karşılaştırmaya devam etmek için bir {itemNoun} daha seçin.</div>
              <div className="text-[11px]">
                En az {min} {itemNoun} gereklidir.
              </div>
            </div>
          ) : (
            <>
              {summary && summary.length > 0 && (
                <div className="mb-4 grid gap-2 sm:grid-cols-3">
                  {summary.map((s) => (
                    <SummaryTile key={s.label} {...s} />
                  ))}
                </div>
              )}

              {chartSeries && chartSeries.length > 0 && (
                <div className="mb-4 rounded-lg border border-hairline bg-surface/30 p-4">
                  <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <div className="eyebrow mb-1">SIRALAMA GEÇMİŞİ</div>
                      <div className="font-editorial text-base font-semibold tracking-tight">
                        {chartTitle}
                      </div>
                      <div className="mt-0.5 text-[11.5px] tabular-nums text-muted-foreground">
                        {drawnSeries.length}/{chartSeries.length} seri çiziliyor
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-md border border-hairline bg-surface/50 p-0.5">
                      {([7, 30, 90] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRange(r)}
                          aria-pressed={range === r}
                          className={cn(
                            "rounded px-2 py-1 text-[11px] font-medium tabular-nums transition",
                            range === r
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {r}G
                        </button>
                      ))}
                    </div>
                  </div>
                  {(missingSeries.length > 0 || partialSeries.length > 0) && (
                    <div className="mb-3 space-y-1 rounded-md border border-dashed border-hairline bg-surface/40 px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
                      {missingSeries.length > 0 && (
                        <div>
                          Seçilen {range} günlük aralıkta sıralama geçmişi bulunmayan kayıtlar:{" "}
                          <span className="text-foreground">
                            {missingSeries.map((s) => s.label).join(", ")}
                          </span>
                          . Bu kayıtlar grafikte çizilmez; boş değerler sıfır olarak gösterilmez.
                        </div>
                      )}
                      {partialSeries.length > 0 && (
                        <div>
                          Kısmi sıralama geçmişi bulunan kayıtlar:{" "}
                          <span className="text-foreground">
                            {partialSeries.map((s) => s.label).join(", ")}
                          </span>
                          . Eksik günler grafikte boşluk olarak gösterilir.
                        </div>
                      )}
                    </div>
                  )}
                  {chartData.length === 0 || drawnSeries.length === 0 ? (
                    <div className="flex h-[260px] items-center justify-center rounded-md border border-dashed border-hairline text-[12px] text-muted-foreground">
                      Seçili aralık için sıralama geçmişi bulunmuyor.
                    </div>
                  ) : (
                    <MultiSeriesTrendChart
                      data={chartData}
                      series={drawnSeries.map((s) => ({
                        id: s.id,
                        label: s.label,
                        // Ordered shared palette → every selected series (up to
                        // the selection max) gets its own distinct color.
                        color:
                          SHARED_SERIES_SEQUENCE[
                            (chartSeries?.findIndex((c) => c.id === s.id) ?? 0) %
                              SHARED_SERIES_SEQUENCE.length
                          ],
                      }))}
                      format="rank"
                      reversed
                      height={260}
                    />
                  )}
                </div>
              )}

              {/* Desktop matrix */}
              <div className="sonar-scroll hidden overflow-auto rounded-lg border border-hairline md:block">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr>
                      <th
                        className="sticky start-0 top-0 z-20 border-b border-hairline bg-surface/95 px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground"
                        style={{ minWidth: 220 }}
                      >
                        Metrik
                      </th>
                      {rows.map((r) => (
                        <th
                          key={idOf(r)}
                          className="sticky top-0 z-10 border-b border-s border-hairline bg-surface/95 px-3 py-2 text-start"
                          style={{ minWidth: 180 }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-editorial text-sm font-semibold text-foreground">
                              {titleOf(r)}
                            </span>
                            {onRemove && (
                              <button
                                type="button"
                                onClick={() => onRemove(idOf(r))}
                                aria-label={`${titleOf(r)} karşılaştırmadan çıkar`}
                                className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          {statusByRowId.get(idOf(r)) === "missing" && (
                            <span className="mt-1 inline-block rounded border border-hairline bg-surface/60 px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                              Geçmiş yok
                            </span>
                          )}
                          {statusByRowId.get(idOf(r)) === "partial" && (
                            <span className="mt-1 inline-block rounded border border-hairline bg-surface/60 px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                              Kısmi geçmiş
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m) => {
                      const best = sharedBestIndex(rows, m);
                      return (
                        <tr key={m.id} className="border-t border-hairline/60">
                          <td
                            className="sticky start-0 z-[5] bg-background px-3 py-2 text-[12px] text-muted-foreground"
                            style={{ minWidth: 220 }}
                          >
                            {m.label}
                          </td>
                          {rows.map((r, i) => (
                            <td
                              key={idOf(r)}
                              className={cn(
                                "border-s border-hairline/60 px-3 py-2 text-[13px] tabular-nums",
                                best === i && "bg-[color:var(--cobalt-soft)]/60 font-medium",
                              )}
                            >
                              {m.render(r)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card */}
              <div className="space-y-3 md:hidden">
                <div className="flex items-center justify-between gap-2 rounded-md border border-hairline bg-surface/40 px-2 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {rows.map((r, i) => (
                      <button
                        key={idOf(r)}
                        type="button"
                        onClick={() => setMobileIdx(i)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-[11px]",
                          i === mobileIdx
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-hairline bg-surface/40 text-muted-foreground",
                        )}
                      >
                        {titleOf(r)}
                      </button>
                    ))}
                  </div>
                </div>
                {rows[mobileIdx] && (
                  <div className="rounded-lg border border-hairline bg-surface/40 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-editorial text-base font-semibold">
                        {titleOf(rows[mobileIdx])}
                      </div>
                      {onRemove && (
                        <button
                          type="button"
                          onClick={() => onRemove(idOf(rows[mobileIdx]))}
                          className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                          aria-label="Karşılaştırmadan çıkar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <dl className="divide-y divide-hairline/60">
                      {metrics.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-3 py-2 text-[13px]"
                        >
                          <dt className="text-muted-foreground">{m.label}</dt>
                          <dd className="tabular-nums">{m.render(rows[mobileIdx])}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Shared bulk-action factory so every keyword table exposes an identical
 * primary "Karşılaştır" action with the same limits and explanations.
 */
export function buildComparisonBulkAction({
  selectedCount,
  onOpen,
  min = SHARED_COMPARISON_MIN,
  max = SHARED_COMPARISON_MAX,
  itemNoun = "anahtar kelime",
}: {
  selectedCount: number;
  onOpen: () => void;
  min?: number;
  max?: number;
  itemNoun?: string;
}): BulkAction {
  const eligible = selectedCount >= min && selectedCount <= max;
  const overLimit = selectedCount > max;
  const label = eligible ? "Karşılaştır" : "Karşılaştır";
  const tooltip =
    selectedCount < min
      ? `Karşılaştırma için en az ${min} ${itemNoun} seçin.`
      : overLimit
        ? `Karşılaştırma için en fazla ${max} ${itemNoun} seçebilirsiniz.`
        : undefined;
  return {
    id: "compare",
    label,
    primary: true,
    disabled: !eligible,
    tooltip,
    hint: overLimit ? `En fazla ${max} seçilebilir; şu anda ${selectedCount} seçili.` : undefined,
    onClick: onOpen,
  };
}
