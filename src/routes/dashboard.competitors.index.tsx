import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Plus,
  X,
  RefreshCw,
  Download,
  Search as SearchIcon,
  Filter as FilterIcon,
  MoreHorizontal,
  Bell,
  BellOff,
  ExternalLink,
  Users,
  Target,
  TrendingDown,
  Sparkles,
  BarChart3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import {
  PageHeader,
  MetricCard,
  Panel,
  SectionHead,
  FilterBar,
  StatusPill,
  INTERACTIVE_CONTROL,
  TOUCH_TARGET,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  SharedDataTable,
  DataGridPagination,
  DataGridDensitySelector,
  DataGridColumnManager,
  DataGridLoadingState,
  ChartCard,
  VisibilityTrendChart,
  MiniRankChart,
  defineColumn,
  defineColumnGroup,
  defineUtilityColumn,
  useTablePreferences,
  WorkspacePage,
  type MultiSeriesTrendSeries,
  type MultiSeriesTrendPoint,
  type SharedDensity,
} from "@/components/shared";
import {
  ANALYTICAL_VARIANT,
  ANALYTICAL_CARD,
  ANALYTICAL_CARD_DENSE,
  ANALYTICAL_CARD_FLUSH,
  ANALYTICAL_CONTROLS,
  ANALYTICAL_KPI,
  ANALYTICAL_NESTED,
  ANALYTICAL_SECTION_HEAD,
  ANALYTICAL_STATE,
  ANALYTICAL_TABLE,
} from "@/design/analytical";

import {
  useCompetitorApps,
  useCompetitorCatalog,
  useCompetitorKeywordDetail,
  useCompetitorKeywordGaps,
  useCompetitorSummary,
  useCompetitorVisibilityHistory,
  GAP_TO_STATUS,
  GAP_CLASSIFICATION_LABEL,
  type CompetitorApp,
  type CompetitorFilters,
  type CompetitorKeywordGapRow,
  type GapClassification,
} from "@/hooks/queries/use-competitors";
import {
  useAddCompetitor,
  useRemoveCompetitor,
  useTrackCompetitorKeyword,
  useUntrackCompetitorKeyword,
} from "@/hooks/mutations/use-competitors-mutations";
import { useScopeChangeEffect } from "@/scope";
import { toast } from "sonner";

/* ============================================================
 * Route metadata
 * ============================================================ */

export const Route = createFileRoute("/dashboard/competitors/")({
  head: () => ({
    meta: [
      { title: "Rakip Analizi — Sonar Dashboard" },
      {
        name: "description",
        content:
          "Rakiplerinizin sıralamalarını, ortak anahtar kelimeleri ve stratejik fırsatları tek çalışma alanında karşılaştırın.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CompetitorsPage,
});

/* ============================================================
 * Utilities & tokens
 * ============================================================ */

const ICON_TONE_CLASS: Record<CompetitorApp["iconTone"], string> = {
  cobalt: "bg-primary/15 text-primary ring-[color:var(--cobalt)]/25",
  violet: "bg-accent-brand/15 text-[color:var(--violet)] ring-[color:var(--violet)]/25",
  success:
    "bg-[color:var(--success)]/15 text-[color:var(--success)] ring-[color:var(--success)]/25",
  warning:
    "bg-[color:var(--warning)]/15 text-[color:var(--warning)] ring-[color:var(--warning)]/25",
  danger: "bg-[color:var(--danger)]/15 text-[color:var(--danger)] ring-[color:var(--danger)]/25",
  neutral: "bg-surface-3 text-muted-foreground ring-hairline",
};

const CLASSIFICATIONS: GapClassification[] = [
  "Ortak Güçlü Kelime",
  "Rakip Üstün",
  "Quick Win",
  "Growth Opportunity",
  "Long-Term Opportunity",
  "Too Competitive",
  "Irrelevant",
];

const RANGE_OPTIONS: { value: 7 | 30 | 90; label: string }[] = [
  { value: 7, label: "7 gün" },
  { value: 30, label: "30 gün" },
  { value: 90, label: "90 gün" },
];

function AppIcon({ app, size = 28 }: { app: CompetitorApp; size?: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium ring-1 ring-inset",
        ICON_TONE_CLASS[app.iconTone],
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden
    >
      {app.monogram}
    </span>
  );
}

function RankCell({ rank }: { rank: number | null }) {
  if (rank == null) return <span className="text-muted-foreground/60">—</span>;
  const tone =
    rank <= 10 ? "text-[color:var(--success)]" : rank <= 50 ? "text-primary" : "text-foreground";
  return <span className={cn("tabular-nums font-medium", tone)}>#{rank}</span>;
}

function GapCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground/60">—</span>;
  if (value === 0) return <span className="tabular-nums text-muted-foreground">0</span>;
  const isBehind = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 tabular-nums",
        isBehind ? "text-[color:var(--danger)]" : "text-[color:var(--success)]",
      )}
    >
      {isBehind ? <TrendingDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
      {Math.abs(value)}
    </span>
  );
}

function ScoreCell({ value }: { value: number }) {
  const tone =
    value >= 75
      ? "text-[color:var(--success)]"
      : value >= 50
        ? "text-primary"
        : "text-muted-foreground";
  return <span className={cn("tabular-nums font-medium", tone)}>{value}</span>;
}

/* ============================================================
 * Competitor selector
 * ============================================================ */

function CompetitorSelector({
  selected,
  catalog,
  onAdd,
  onRemove,
}: {
  selected: CompetitorApp[];
  catalog: CompetitorApp[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedIds = new Set(selected.map((s) => s.id));
  const available = catalog.filter((a) => !a.isOwn && !selectedIds.has(a.id));
  const competitorCount = selected.filter((s) => !s.isOwn).length;

  return (
    <Panel className={cn(ANALYTICAL_CARD_DENSE, ANALYTICAL_CONTROLS, "flex flex-col gap-3")}>
      <div className="flex items-center justify-between">
        <SectionHead
          eyebrow="Karşılaştırma"
          title="İzlenen Rakipler"
          sub={`Kendi uygulamanız + ${competitorCount} rakip (en fazla 5)`}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-hairline text-xs"
              disabled={available.length === 0 || competitorCount >= 5}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Rakip Ekle
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-1">
            <div className="max-h-72 overflow-y-auto">
              {available.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  Eklenecek başka rakip yok
                </div>
              ) : (
                available.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-3"
                    onClick={() => {
                      onAdd(a.id);
                      setOpen(false);
                    }}
                  >
                    <AppIcon app={a} size={24} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{a.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {a.developer}
                      </div>
                    </div>
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-wrap gap-2">
        {selected.map((app) => (
          <div
            key={app.id}
            className={cn(
              "group flex items-center gap-2 rounded-lg border border-hairline bg-surface/60 py-1.5 pl-1.5 pr-2 transition-colors",
              app.isOwn && "ring-1 ring-[color:var(--cobalt)]/30",
            )}
          >
            <AppIcon app={app} size={28} />
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span className="max-w-[140px] truncate">{app.name}</span>
                {app.isOwn && (
                  <span className="rounded-sm bg-primary/15 px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide text-primary">
                    Sizin
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground">{app.developer}</div>
            </div>
            {!app.isOwn && (
              <button
                type="button"
                aria-label={`${app.name} rakibini kaldır`}
                className={cn(
                  "ml-1 rounded p-0.5 text-muted-foreground transition-opacity hover:bg-surface-3 hover:text-foreground",
                  "opacity-0 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-100",
                  INTERACTIVE_CONTROL,
                  TOUCH_TARGET,
                )}
                onClick={() => onRemove(app.id)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ============================================================
 * KPI cards
 * ============================================================ */

function CompetitorSummaryCards({ competitorIds }: { competitorIds: string[] }) {
  const { data, isLoading, isError, refetch } = useCompetitorSummary(competitorIds);
  if (isError) {
    return <ErrorState description="Rakip özeti yüklenemedi." onRetry={() => refetch()} />;
  }
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-[152px]" />
        ))}
      </div>
    );
  }
  const kpiClass = cn(ANALYTICAL_KPI, "h-full");
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        className={kpiClass}
        label="İzlenen Rakip"
        value={data.trackedCompetitors.value}
        delta={data.trackedCompetitors.delta}
        trend={data.trackedCompetitors.trend}
        note={data.trackedCompetitors.note}
      />
      <MetricCard
        className={kpiClass}
        label="Ortak Anahtar Kelime"
        value={data.sharedKeywords.value}
        delta={data.sharedKeywords.delta}
        trend={data.sharedKeywords.trend}
        note={data.sharedKeywords.note}
        series={data.sharedKeywords.series}
      />
      <MetricCard
        className={kpiClass}
        label="Fırsat Kelime"
        value={data.opportunities.value}
        delta={data.opportunities.delta}
        trend={data.opportunities.trend}
        note={data.opportunities.note}
        series={data.opportunities.series}
        seriesColor="var(--success)"
      />
      <MetricCard
        className={kpiClass}
        label="Ortalama Görünürlük Farkı"
        value={
          data.visibilityGap.value >= 0 ? `+${data.visibilityGap.value}` : data.visibilityGap.value
        }
        suffix="sıra"
        delta={data.visibilityGap.delta}
        trend={data.visibilityGap.trend}
        note={data.visibilityGap.note}
      />
    </div>
  );
}

/* ============================================================
 * Visibility comparison chart
 * ============================================================ */

const VISIBILITY_COLORS = [
  "var(--cobalt)",
  "var(--violet)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
  "var(--muted-foreground)",
];

function VisibilityChartPanel({ competitorIds }: { competitorIds: string[] }) {
  const [range, setRange] = React.useState<7 | 30 | 90>(30);
  const { data, isLoading, isError, refetch } = useCompetitorVisibilityHistory(
    competitorIds,
    range,
  );

  const { chartData, series } = React.useMemo(() => {
    if (!data)
      return { chartData: [] as MultiSeriesTrendPoint[], series: [] as MultiSeriesTrendSeries[] };
    const chartData: MultiSeriesTrendPoint[] = data.labels.map((label) => {
      const row: MultiSeriesTrendPoint = { label: label.slice(5) };
      for (const s of data.series) {
        const point = s.points.find((p) => p.date === label);
        row[s.appId] = point?.value ?? 0;
      }
      return row;
    });
    const series: MultiSeriesTrendSeries[] = data.series.map((s, idx) => ({
      id: s.appId,
      label: s.appName,
      color: s.isOwn ? "var(--cobalt)" : VISIBILITY_COLORS[(idx + 1) % VISIBILITY_COLORS.length],
      strokeWidth: s.isOwn ? 2.5 : 1.75,
      dashed: !s.isOwn && idx > 3,
    }));
    return { chartData, series };
  }, [data]);

  return (
    <ChartCard
      className={ANALYTICAL_CARD}
      eyebrow="Zaman Serisi"
      title="Görünürlük Karşılaştırması"
      description="Uygulama başına günlük tahmini görünürlük skoru (0–100)."
      height={280}
      isLoading={isLoading || !data}
      isError={isError}
      errorMessage="Görünürlük verisi yüklenemedi."
      onRetry={() => refetch()}
      actions={
        <div
          className={cn(ANALYTICAL_CONTROLS, ANALYTICAL_NESTED, "flex items-center gap-1 p-0.5")}
        >
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={cn(
                "rounded px-2 py-1 text-[11px] font-medium transition-colors",
                range === r.value
                  ? "bg-surface-3 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      <VisibilityTrendChart
        data={chartData}
        series={series}
        height={280}
        tickInterval={Math.max(1, Math.floor(chartData.length / 8))}
      />
    </ChartCard>
  );
}

/* ============================================================
 * Column factory (dynamic on selected competitors)
 * ============================================================ */

interface RowHandlers {
  toggleTracking: (row: CompetitorKeywordGapRow) => void;
  openDetail: (row: CompetitorKeywordGapRow) => void;
}

function buildColumns(
  competitors: CompetitorApp[],
  handlers: RowHandlers,
): ColumnDef<CompetitorKeywordGapRow>[] {
  const compsWithoutOwn = competitors.filter((c) => !c.isOwn);

  const identityGroup = defineColumnGroup<CompetitorKeywordGapRow>("grp_identity", "", [
    defineUtilityColumn<CompetitorKeywordGapRow>({
      id: "__select",
      label: "Seçim",
      header: ({ table }) => (
        <Checkbox
          aria-label="Tümünü seç"
          className={cn(INTERACTIVE_CONTROL, TOUCH_TARGET)}
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: (_row, { row }) => (
        <Checkbox
          aria-label="Satırı seç"
          className={cn(INTERACTIVE_CONTROL, TOUCH_TARGET)}
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    }),
    defineColumn<CompetitorKeywordGapRow>({
      id: "keyword",
      label: "Anahtar Kelime",
      role: "primaryTextDense",
      accessorFn: (r) => r.keyword,
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{r.keyword}</span>
          <StatusPill status={GAP_TO_STATUS[r.classification]} />
        </div>
      ),
    }),
  ]);

  const rankGroup = defineColumnGroup<CompetitorKeywordGapRow>("grp_rank", "Sıralama", [
    defineColumn<CompetitorKeywordGapRow>({
      id: "ownRank",
      label: "Sizin Sıranız",
      metricKey: "currentRank",
      role: "rank",
      accessorFn: (r) => r.ownRank,
      cell: (r) => <RankCell rank={r.ownRank} />,
    }),
    defineColumn<CompetitorKeywordGapRow>({
      id: "bestCompetitorRank",
      metricKey: "bestCompetitorRank",
      role: "rank",
      accessorFn: (r) => r.bestCompetitorRank,
      cell: (r) => <RankCell rank={r.bestCompetitorRank} />,
    }),
    defineColumn<CompetitorKeywordGapRow>({
      id: "rankGap",
      metricKey: "rankGap",
      role: "rankDelta",
      accessorFn: (r) => r.rankGap,
      cell: (r) => <GapCell value={r.rankGap} />,
    }),
  ]);

  const competitorGroup = defineColumnGroup<CompetitorKeywordGapRow>(
    "grp_competitors",
    "Rakip Sıralamaları",
    compsWithoutOwn.map((comp) =>
      defineColumn<CompetitorKeywordGapRow>({
        id: `comp_${comp.id}`,
        // The header shows the exact app name; CSS clamps it to two lines and
        // the full value stays available via title + column manager.
        label: `${comp.name} Sırası`,
        role: "competitorRank",
        info: `${comp.name} uygulamasının bu anahtar kelimedeki güncel sıralaması.`,
        preserveLabelCase: true,
        headerContent: (
          <span className="flex min-w-0 items-center gap-1" title={comp.name}>
            <span className="shrink-0 leading-none">
              <AppIcon app={comp} size={14} />
            </span>
            <span className="line-clamp-2 min-w-0 break-words">{comp.name}</span>
          </span>
        ),
        accessorFn: (r) => r.competitorRanks.find((cr) => cr.appId === comp.id)?.rank ?? null,
        cell: (r) => (
          <RankCell rank={r.competitorRanks.find((cr) => cr.appId === comp.id)?.rank ?? null} />
        ),
      }),
    ),
  );

  const metricsGroup = defineColumnGroup<CompetitorKeywordGapRow>(
    "grp_metrics",
    "Fırsat Metrikleri",
    [
      defineColumn<CompetitorKeywordGapRow>({
        id: "volumeScore",
        metricKey: "estimatedVolume",
        useShortLabel: true,
        role: "score",
        accessorFn: (r) => r.volumeScore,
        cell: (r) => <ScoreCell value={r.volumeScore} />,
      }),
      defineColumn<CompetitorKeywordGapRow>({
        id: "difficulty",
        role: "score",
        accessorFn: (r) => r.difficulty,
        cell: (r) => <ScoreCell value={r.difficulty} />,
      }),
      defineColumn<CompetitorKeywordGapRow>({
        id: "opportunity",
        useShortLabel: true,
        role: "score",
        accessorFn: (r) => r.opportunity,
        cell: (r) => <ScoreCell value={r.opportunity} />,
      }),
      defineColumn<CompetitorKeywordGapRow>({
        id: "relevance",
        role: "score",
        accessorFn: (r) => r.relevance,
        cell: (r) => <ScoreCell value={r.relevance} />,
      }),
      defineColumn<CompetitorKeywordGapRow>({
        id: "competitorCoverage",
        metricKey: "competitorCoverage",
        useShortLabel: true,
        role: "score",
        accessorFn: (r) => r.competitorCoverage,
        cell: (r) => (
          <span className="tabular-nums text-muted-foreground">
            {r.competitorCoverage}/{compsWithoutOwn.length}
          </span>
        ),
      }),
    ],
  );

  /* Spacer keeps the last data column readable under the right-pinned actions. */
  const actionsGroup = defineColumnGroup<CompetitorKeywordGapRow>("grp_actions", "", [
    defineUtilityColumn<CompetitorKeywordGapRow>({
      id: "_actionsSpacer",
      label: "",
      role: "actions",
      cell: () => null,
    }),
    defineUtilityColumn<CompetitorKeywordGapRow>({
      id: "__actions",
      label: "İşlemler",
      role: "actions",
      align: "center",
      cell: (r) => (
        <div className="flex items-center justify-center gap-1" data-row-noclick="true">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "rounded p-1 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                    INTERACTIVE_CONTROL,
                    TOUCH_TARGET,
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlers.toggleTracking(r);
                  }}
                  aria-label={r.isTracked ? "Takipten çıkar" : "Anahtar kelimeyi takibe al"}
                >
                  {r.isTracked ? (
                    <BellOff className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{r.isTracked ? "Takipten çıkar" : "Takibe al"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "rounded p-1 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                  INTERACTIVE_CONTROL,
                  TOUCH_TARGET,
                )}
                onClick={(e) => e.stopPropagation()}
                aria-label="Daha fazla eylem"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handlers.openDetail(r)}>
                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Detayları Aç
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers.toggleTracking(r)}>
                {r.isTracked ? (
                  <>
                    <BellOff className="mr-2 h-3.5 w-3.5" /> Takipten Çıkar
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-3.5 w-3.5" /> Takibe Al
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info(`${r.keyword} panoya kopyalandı`)}>
                <Download className="mr-2 h-3.5 w-3.5" /> Kelimeyi Kopyala
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ]);

  return compsWithoutOwn.length
    ? [identityGroup, rankGroup, competitorGroup, metricsGroup, actionsGroup]
    : [identityGroup, rankGroup, metricsGroup, actionsGroup];
}

/* ============================================================
 * Filter popover
 * ============================================================ */

interface UiFilters {
  search: string;
  classifications: GapClassification[];
  competitorFocus: string;
  ownRankMax?: number;
  volumeMin?: number;
  difficultyMax?: number;
}

const DEFAULT_UI_FILTERS: UiFilters = {
  search: "",
  classifications: [],
  competitorFocus: "all",
  ownRankMax: undefined,
  volumeMin: undefined,
  difficultyMax: undefined,
};

function toServerFilters(ui: UiFilters, allIds: string[]): CompetitorFilters {
  return {
    classifications: ui.classifications.length ? ui.classifications : undefined,
    competitorIds: ui.competitorFocus === "all" ? undefined : [ui.competitorFocus],
    ownRankMax: ui.ownRankMax,
    volumeMin: ui.volumeMin,
    difficultyMax: ui.difficultyMax,
  };
}

function FilterPopover({
  filters,
  setFilters,
}: {
  filters: UiFilters;
  setFilters: React.Dispatch<React.SetStateAction<UiFilters>>;
}) {
  const active =
    filters.classifications.length +
    (filters.ownRankMax != null ? 1 : 0) +
    (filters.volumeMin != null ? 1 : 0) +
    (filters.difficultyMax != null ? 1 : 0);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 border-hairline text-xs">
          <FilterIcon className="mr-1 h-3.5 w-3.5" />
          Filtreler
          {active > 0 && (
            <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 text-[10px] font-medium text-primary">
              {active}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4 p-4">
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Sınıflandırma
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CLASSIFICATIONS.map((c) => {
              const on = filters.classifications.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      classifications: on
                        ? f.classifications.filter((x) => x !== c)
                        : [...f.classifications, c],
                    }))
                  }
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] transition-colors",
                    on
                      ? "border-primary/40 bg-primary/12 text-primary"
                      : "border-hairline bg-surface/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {GAP_CLASSIFICATION_LABEL[c]}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">Sıranız ≤</label>
            <Input
              type="number"
              min={1}
              max={200}
              placeholder="200"
              className="h-8 text-xs"
              value={filters.ownRankMax ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  ownRankMax: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">Aranma Hacmi ≥</label>
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="0"
              className="h-8 text-xs"
              value={filters.volumeMin ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  volumeMin: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">Zorluk ≤</label>
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="100"
              className="h-8 text-xs"
              value={filters.difficultyMax ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  difficultyMax: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setFilters(DEFAULT_UI_FILTERS)}
          >
            Sıfırla
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ============================================================
 * Detail drawer
 * ============================================================ */

function KeywordDetailDrawer({
  rowId,
  competitors,
  onClose,
  onToggleTracking,
}: {
  rowId: string | null;
  competitors: CompetitorApp[];
  onClose: () => void;
  onToggleTracking: (row: CompetitorKeywordGapRow) => void;
}) {
  const competitorIds = React.useMemo(
    () => competitors.filter((c) => !c.isOwn).map((c) => c.id),
    [competitors],
  );
  const { data, isLoading } = useCompetitorKeywordDetail(rowId, competitorIds);
  const open = !!rowId;

  const rankChartData = React.useMemo(() => {
    if (!data) return [] as MiniRankPoint[];
    return data.historyOwn
      .filter((p) => p.rank != null)
      .map((p) => ({ v: p.rank as number, label: p.date }));
  }, [data]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-[540px]">
        <SheetHeader className="border-b border-hairline p-4">
          <SheetTitle className="font-editorial text-base">
            {data?.row.keyword ?? "Yükleniyor…"}
          </SheetTitle>
          {data && (
            <div className="mt-1 flex items-center gap-2">
              <StatusPill status={GAP_TO_STATUS[data.row.classification]} />
              <span className="text-[11px] text-muted-foreground">
                Son güncelleme {data.row.updatedMinutesAgo} dk önce
              </span>
            </div>
          )}
        </SheetHeader>
        {isLoading || !data ? (
          <div className="space-y-3 p-4">
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-40" />
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-3 gap-2">
              <MiniMetric label="Sizin Sıra" value={data.row.ownRank ?? "—"} />
              <MiniMetric label="En İyi Rakip" value={data.row.bestCompetitorRank ?? "—"} />
              <MiniMetric label="Fırsat" value={data.row.opportunity} />
              <MiniMetric label="Aranma Hacmi" value={data.row.volumeScore} />
              <MiniMetric label="Zorluk" value={data.row.difficulty} />
              <MiniMetric label="Alaka" value={data.row.relevance} />
            </div>
            <Panel className="p-3">
              <SectionHead eyebrow="Sıra Geçmişi" title="Sizin uygulamanız (30 gün)" />
              {rankChartData.length ? (
                <MiniRankChart data={rankChartData} height={120} intent="primary" />
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Top 200 içinde bulunamadı
                </div>
              )}
            </Panel>
            <Panel className="p-3">
              <SectionHead eyebrow="Rakip Sıralamaları" title="Şu andaki durum" />
              <div className="mt-2 divide-y divide-hairline">
                {competitors
                  .filter((c) => !c.isOwn)
                  .map((c) => {
                    const rank =
                      data.row.competitorRanks.find((cr) => cr.appId === c.id)?.rank ?? null;
                    return (
                      <div key={c.id} className="flex items-center gap-2 py-2 text-xs">
                        <AppIcon app={c} size={22} />
                        <span className="flex-1 truncate">{c.name}</span>
                        <RankCell rank={rank} />
                      </div>
                    );
                  })}
              </div>
            </Panel>
            <div className="flex items-center justify-between border-t border-hairline pt-4">
              <div className="text-[11px] text-muted-foreground">
                SERP Kararlılığı: <span className="text-foreground">{data.serpStability}</span>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs"
                variant={data.row.isTracked ? "outline" : "default"}
                onClick={() => onToggleTracking(data.row)}
              >
                {data.row.isTracked ? (
                  <>
                    <BellOff className="mr-1.5 h-3.5 w-3.5" /> Takipten Çıkar
                  </>
                ) : (
                  <>
                    <Bell className="mr-1.5 h-3.5 w-3.5" /> Takibe Al
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

type MiniRankPoint = { v: number; label?: string };

function MiniMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-hairline bg-surface/60 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-editorial text-lg tabular-nums">{value}</div>
    </div>
  );
}

/* ============================================================
 * Page
 * ============================================================ */

function CompetitorsPage() {
  /* ---------- selection & catalog ---------- */
  const { data: catalog = [] } = useCompetitorCatalog();
  const { data: selectedApps = [] } = useCompetitorApps();
  const addCompetitor = useAddCompetitor();
  const removeCompetitor = useRemoveCompetitor();
  const track = useTrackCompetitorKeyword();
  const untrack = useUntrackCompetitorKeyword();

  const competitorIds = React.useMemo(
    () => selectedApps.filter((a) => !a.isOwn).map((a) => a.id),
    [selectedApps],
  );

  /* ---------- table state ---------- */
  const [ui, setUi] = React.useState<UiFilters>(DEFAULT_UI_FILTERS);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "opportunity", desc: true }]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);
  const [detailRowId, setDetailRowId] = React.useState<string | null>(null);

  /**
   * A scope switch (application, store, country, market locale or date range)
   * means every row identity below belongs to the previous market. Reset only
   * row-bound state — filters, sorting and table preferences are preserved.
   */
  useScopeChangeEffect(() => {
    setRowSelection({});
    setPageIndex(0);
    setDetailRowId(null);
  });

  /* Workspace preset preferences — isolated under this table's stable id. */
  const prefs = useTablePreferences("competitor-keyword-gap", {
    defaultDensity: "comfortable",
  });
  const {
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    density,
    setDensity,
  } = prefs;

  React.useEffect(() => {
    setPageIndex(0);
  }, [ui, sorting, competitorIds]);

  const request = React.useMemo(
    () => ({
      page: pageIndex + 1,
      pageSize,
      search: ui.search || undefined,
      sorting: sorting.map((s) => ({ id: s.id, desc: s.desc })),
      filters: toServerFilters(ui, competitorIds),
      competitorIds,
    }),
    [pageIndex, pageSize, ui, sorting, competitorIds],
  );

  const gapsQuery = useCompetitorKeywordGaps(request);
  const gapsData = gapsQuery.data;
  const rows = gapsData?.items ?? [];
  const total = gapsData?.total ?? 0;
  const totalPages = gapsData?.totalPages ?? 1;

  /* Keep the page index valid: a shrinking result set (mutation, tighter
     filter) must step back to the last real page instead of rendering a blank
     grid. A refreshed array with the same shape never resets the page. */
  React.useEffect(() => {
    if (!gapsQuery.isFetching && pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [pageIndex, totalPages, gapsQuery.isFetching]);


  /* ---------- handlers ---------- */
  const handleToggleTracking = React.useCallback(
    (row: CompetitorKeywordGapRow) => {
      if (row.isTracked) {
        untrack.mutate(row.id, {
          onSuccess: () => toast.success(`"${row.keyword}" takipten çıkarıldı`),
        });
      } else {
        track.mutate(row.id, {
          onSuccess: () => toast.success(`"${row.keyword}" takibe alındı`),
        });
      }
    },
    [track, untrack],
  );

  const handleOpenDetail = React.useCallback(
    (row: CompetitorKeywordGapRow) => setDetailRowId(row.id),
    [],
  );

  const columns = React.useMemo(
    () =>
      buildColumns(selectedApps, {
        toggleTracking: handleToggleTracking,
        openDetail: handleOpenDetail,
      }),
    [selectedApps, handleToggleTracking, handleOpenDetail],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    rowCount: total,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnOrder,
      columnSizing,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getRowId: (r) => r.id,
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
    initialState: {
      columnPinning: { left: ["__select", "keyword"], right: ["__actions"] },
    },
  });

  /* Column reordering — shared manager only mutates the persisted order. */
  const applyMove = React.useCallback(
    (columnId: string, resolveTarget: (base: string[], from: number) => number) => {
      const leafOrder = table.getAllLeafColumns().map((c) => c.id);
      setColumnOrder((prev) => {
        const base = prev.length ? [...prev] : leafOrder;
        const from = base.indexOf(columnId);
        if (from === -1) return prev;
        const to = resolveTarget(base, from);
        if (to < 0 || to >= base.length) return prev;
        base.splice(to, 0, base.splice(from, 1)[0]);
        return base;
      });
    },
    [table, setColumnOrder],
  );
  const reorderColumns = React.useCallback(
    (draggedId: string, targetId: string) => applyMove(draggedId, (base) => base.indexOf(targetId)),
    [applyMove],
  );
  const moveColumn = React.useCallback(
    (columnId: string, delta: number) => applyMove(columnId, (_b, from) => from + delta),
    [applyMove],
  );

  const selectedRowCount = Object.values(rowSelection).filter(Boolean).length;

  const bulkActions = React.useMemo(
    () => [
      {
        id: "track",
        label: "Takibe Al",
        icon: Bell,
        onClick: () => {
          const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]);
          ids.forEach((id) => track.mutate(id));
          toast.success(`${ids.length} kelime takibe alındı`);
          setRowSelection({});
        },
      },
      {
        id: "export",
        label: "Dışa Aktar",
        icon: Download,

        onClick: () => toast.info("Dışa aktarma hazırlanıyor…"),
      },
    ],
    [rowSelection, track],
  );

  const canAddMore = competitorIds.length < 5;

  return (
    <WorkspacePage className={cn(ANALYTICAL_VARIANT, "space-y-5")}>
      <PageHeader
        className="mb-0"
        eyebrow="RAKİP ZEKÂSI"
        title="Rakip Analizi"
        description="Rakiplerinizle olan anahtar kelime örtüşmesini, sıralama farkını ve stratejik fırsatları tek noktadan karşılaştırın."
        actions={
          <div className={cn(ANALYTICAL_CONTROLS, "flex flex-wrap items-center gap-2")}>
            <Button
              size="sm"
              variant="outline"
              className="h-9 border-hairline bg-surface/50 px-3 text-xs"
              onClick={() => gapsQuery.refetch()}
              disabled={gapsQuery.isFetching}
            >
              <RefreshCw
                className={cn("mr-1 h-3.5 w-3.5", gapsQuery.isFetching && "animate-spin")}
              />
              Yenile
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 border-hairline bg-surface/50 px-3 text-xs"
              onClick={() => toast.info("Dışa aktarma hazırlanıyor…")}
            >
              <Download className="mr-1 h-3.5 w-3.5" /> Dışa Aktar
            </Button>
          </div>
        }
      />

      <CompetitorSelector
        selected={selectedApps}
        catalog={catalog}
        onAdd={(id) =>
          canAddMore
            ? addCompetitor.mutate(id, {
                onSuccess: () => toast.success("Rakip eklendi"),
              })
            : toast.error("En fazla 5 rakip izleyebilirsiniz")
        }
        onRemove={(id) =>
          removeCompetitor.mutate(id, {
            onSuccess: () => toast.success("Rakip kaldırıldı"),
          })
        }
      />

      <CompetitorSummaryCards competitorIds={competitorIds} />

      <VisibilityChartPanel competitorIds={competitorIds} />

      <Panel className={ANALYTICAL_CARD_FLUSH}>
        <div
          className={cn(
            "border-b border-[color:var(--border)] px-4 py-3 sm:px-5",
            ANALYTICAL_SECTION_HEAD,
          )}
        >
          <SectionHead
            eyebrow="Anahtar Kelime Boşluk Analizi"
            title="Anahtar Kelime Boşluk Tablosu"
            sub="Sizin ve rakiplerinizin sıralamalarını, yalnızca rakiplerinizin sıralandığı kelimeler dahil olmak üzere karşılaştırın."
          />
        </div>
        <FilterBar
          className={cn(
            ANALYTICAL_CONTROLS,
            "rounded-none border-0 border-b border-[color:var(--border)] bg-transparent px-4 py-2.5 sm:px-5",
          )}
        >
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={ui.search}
              onChange={(e) => setUi((f) => ({ ...f, search: e.target.value }))}
              placeholder="Anahtar kelime ara…"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Select
            value={ui.competitorFocus}
            onValueChange={(v) => setUi((f) => ({ ...f, competitorFocus: v }))}
          >
            <SelectTrigger className="h-8 w-[180px] border-hairline text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                Tüm rakipler
              </SelectItem>
              {selectedApps
                .filter((a) => !a.isOwn)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    Yalnızca {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <FilterPopover filters={ui} setFilters={setUi} />
          <div className="ml-auto flex items-center gap-1.5">
            <DataGridDensitySelector value={density} onChange={setDensity} />
            <DataGridColumnManager
              table={table}
              onReset={prefs.resetAll}
              onMoveColumn={moveColumn}
              onReorderColumns={reorderColumns}
            />
          </div>
        </FilterBar>

        {gapsQuery.isError ? (
          <ErrorState
            className={cn(ANALYTICAL_STATE, "m-5")}
            description="Anahtar kelime boşluk verisi yüklenemedi."
            onRetry={() => gapsQuery.refetch()}
          />
        ) : rows.length === 0 && !gapsQuery.isLoading ? (
          <EmptyState
            className={cn(ANALYTICAL_STATE, "m-5")}
            title="Eşleşen anahtar kelime yok"
            description="Filtreleri gevşetin veya farklı bir rakibe odaklanın."
          />
        ) : (
          <div className={ANALYTICAL_TABLE}>
            <SharedDataTable
              table={table}
              density={density}
              onRowClick={(row) => setDetailRowId(row.id)}
              isRowActive={(row) => row.id === detailRowId}
              isLoading={gapsQuery.isLoading && !gapsData}
              enableReorder
              onReorder={reorderColumns}
              onColumnWidthCommit={prefs.commitColumnWidth}
              loadingRowCount={Math.min(pageSize, 8)}
              bulkSelection={{
                count: selectedRowCount,
                itemNoun: "anahtar kelime",
                primary: bulkActions,
                onClear: () => setRowSelection({}),
              }}
            />
          </div>
        )}

        <DataGridPagination table={table} totalRows={total} />
      </Panel>

      <KeywordDetailDrawer
        rowId={detailRowId}
        competitors={selectedApps}
        onClose={() => setDetailRowId(null)}
        onToggleTracking={handleToggleTracking}
      />
    </WorkspacePage>
  );
}
