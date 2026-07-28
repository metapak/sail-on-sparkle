import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import type { ListRequest } from "@/api/pagination";
import { ANALYSIS_MARKETS, STORE_LABEL, useAnalysisScope, useScopeIdentityEffect } from "@/scope";
import {
  Search,
  Filter,
  Plus,
  Download,
  RotateCcw,
  X,
  Sparkles,
  Info,
  ArrowUpRight,
  Bell,
  BellOff,
  Star,
  RefreshCw,
  Tag,
  FolderPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type ColumnSizingState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useDashboardSummaryData } from "@/hooks/queries/use-dashboard-summary";
import { useTrackedViewPreferences } from "@/hooks/queries/use-tracked-view-preferences";
// keyword-history helpers now come from the shared barrel below
import {
  Panel,
  ChangeCell,
  StatusPill,
  INTERACTIVE_CONTROL,
  TOUCH_TARGET,
  STATUS_EXPLAIN,
  rankLabel,
  coverageForKeyword,
  COVERAGE_TONE,
  BaseTimeSeriesChart,
  SonarDataGrid,
  DataGridColumnManager,
  DataGridDensitySelector,
  DataGridPagination,
  DataGridSavedViews,
  DataFreshnessIndicator,
  freshnessFromMinutes,
  getKeywordHistory,
  summarizeRange,
  type RankEvent,
  type Density,
  type SavedView,
  type BulkAction,
  SharedComparisonDialog,
  buildKeywordCompareSeries,
  buildComparisonBulkAction,
  SHARED_COMPARISON_MIN,
  SHARED_COMPARISON_MAX,
  type SharedCompareMetric,
  type SharedComparisonSummaryItem,
  type SharedComparisonChartSeries,
  WorkspacePage,
} from "@/components/shared";
import {
  ANALYTICAL_VARIANT,
  ANALYTICAL_CARD,
  ANALYTICAL_KPI,
  ANALYTICAL_CARD_DENSE,
  ANALYTICAL_CARD_FLUSH,
  ANALYTICAL_CONTROLS,
  ANALYTICAL_SECTION_HEAD,
  ANALYTICAL_TABLE,
} from "@/design/analytical";

import {
  makeKeywordColumns,
  getDefaultColumnVisibility,
  DEFAULT_COLUMN_PINNING,
  type KeywordColumnHandlers,
} from "@/lib/keywords/columns";
import { useTrackedKeywordsWorkspace } from "@/hooks/queries/use-tracked-keywords-workspace";
import {
  useTrackedKeywordsPaginated,
  type TrackedKeywordsRequest,
} from "@/hooks/queries/use-tracked-keywords";
import type { KeywordRecord } from "@/lib/keywords/types";
import {
  BUILT_IN_VIEWS,
  DEFAULT_FILTERS,
  FILTER_OPTIONS,
  countAdvancedFilters,
  type BuiltInViewId,
  type FilterOption,
  type KeywordFilters,
  type Movement,
  type OppFilter,
  type OppLevel,
  type ViewSnapshot,
} from "@/lib/keywords/views";

const kwSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export const Route = createFileRoute("/dashboard/keywords/tracked")({
  head: () => ({
    meta: [
      { title: "Takip Edilen Anahtar Kelimeler — Sonar Dashboard" },
      {
        name: "description",
        content:
          "Takip ettiğiniz anahtar kelimelerin sıralamalarını, talep sinyallerini, rekabet düzeyini ve büyüme fırsatlarını yönetin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: KeywordsPage,
});

/* ================================================================
   PAGE
================================================================ */
function KeywordsPage() {
  const store = useTrackedKeywordsWorkspace();
  const [selected, setSelected] = React.useState<KeywordRecord | null>(null);
  const [filters, setFilters] = React.useState<KeywordFilters>(DEFAULT_FILTERS);
  const [viewId, setViewId] = React.useState<BuiltInViewId>("all");
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "opportunity", desc: true }]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);
  const [addOpen, setAddOpen] = React.useState(false);

  /**
   * A scope switch means the previous rows describe a different market. Reset
   * every piece of row-bound UI state so nothing stale stays on screen.
   */
  useScopeIdentityEffect(() => {
    setSelected(null);
    setRowSelection({});
    setPageIndex(0);
  });

  /* -------- Column handlers -------- */
  const handlers: KeywordColumnHandlers = React.useMemo(
    () => ({
      toggleFavorite: (id) => store.toggleFavorite(id),
      toggleTracked: (id) => store.toggleTracked(id),
      openQuickPreview: (r) => setSelected(r),
      refresh: (id) => {
        toast.info(`"${idToName(store.records, id)}" yenileniyor…`);
        store
          .refreshMany([id])
          .then(() => toast.success(`"${idToName(store.records, id)}" güncellendi.`));
      },
    }),
    [store],
  );

  const columns = React.useMemo(() => makeKeywordColumns(handlers), [handlers]);
  const defaultVisibility = React.useMemo(() => getDefaultColumnVisibility(columns), [columns]);

  /* -------- Persisted state (density / visibility / saved views) -------- */
  const prefs = useTrackedViewPreferences(defaultVisibility);
  const {
    density,
    setDensity,
    visibility,
    setVisibility,
    columnSizing,
    setColumnSizing,
    savedViews,
    setSavedViews,
    initialDefault,
    setDefaultViewId,
  } = prefs;

  /* -------- Server-side-ready request -------- */
  const advancedCount = React.useMemo(() => countAdvancedFilters(filters), [filters]);

  const paginationRequest = React.useMemo<ListRequest>(
    () => ({
      page: pageIndex + 1,
      pageSize,
      search: filters.q?.trim() || undefined,
      sorting: sorting.map((s) => ({ id: s.id, desc: s.desc })),
      filters: { ...filters, q: "", viewId } as unknown as Record<string, unknown>,
    }),
    [pageIndex, pageSize, filters, sorting, viewId],
  );

  const pagedQuery = useTrackedKeywordsPaginated(paginationRequest);
  const pagedRows = React.useMemo(
    () => (pagedQuery.data?.items ?? []) as unknown as KeywordRecord[],
    [pagedQuery.data],
  );
  const total = pagedQuery.data?.total ?? 0;
  const totalPages = pagedQuery.data?.totalPages ?? 1;

  /* -------- Aggregation snapshot (auxiliary full-dataset usage) --------
     JUSTIFIED: the built-in view chips and the summary strip show counts for
     the WHOLE tracked set (all / tracked / favorites / …), which cannot be
     derived from the current page. The primary table never reads this. */
  const viewCounts = React.useMemo(() => countByBuiltInView(store.records), [store.records]);
  const totalRecords = store.records.length;
  const trackedCount = viewCounts.tracked;
  const shownTotal = total;

  /* -------- Table instance (manual pagination/sorting/filtering) -------- */
  const table = useReactTable<KeywordRecord>({
    data: pagedRows,
    columns,
    getRowId: (r) => r.id,
    state: {
      sorting,
      columnVisibility: visibility,
      rowSelection,
      columnPinning: DEFAULT_COLUMN_PINNING,
      columnSizing,
      pagination: { pageIndex, pageSize },
    },
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
    columnResizeDirection: "ltr",
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    rowCount: total,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setVisibility,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  // Reset page when filters/view change
  React.useEffect(() => {
    setPageIndex(0);
  }, [filters, viewId, sorting]);

  // Keep the current page valid: a mutation (untrack / remove) can shrink the
  // result set so the current page no longer exists — step back to the last
  // valid page instead of showing an empty grid. Filters/sorting stay intact.
  React.useEffect(() => {
    if (!pagedQuery.isFetching && pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [pageIndex, totalPages, pagedQuery.isFetching]);

  /* -------- Selection helpers -------- */
  const selectedIds = React.useMemo(() => Object.keys(rowSelection), [rowSelection]);
  const clearSelection = React.useCallback(() => setRowSelection({}), []);

  /* -------- Saved views handlers -------- */
  const currentSnapshot: ViewSnapshot = {
    viewId,
    filters,
    sorting,
    visibility,
    density,
    pageSize,
  };
  const applySnapshot = React.useCallback(
    (s: ViewSnapshot) => {
      setViewId(s.viewId ?? "all");
      setFilters(s.filters ?? DEFAULT_FILTERS);
      if (Array.isArray(s.sorting)) setSorting(s.sorting as SortingState);
      if (s.visibility) setVisibility(s.visibility);
      if (s.density) setDensity(s.density);
      if (s.pageSize) setPageSize(s.pageSize);
      setPageIndex(0);
    },
    [setDensity, setVisibility],
  );

  const saveView = (name: string, snap: ViewSnapshot) => {
    const v: SavedView<ViewSnapshot> = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      snapshot: snap,
      createdAt: new Date().toISOString(),
    };
    setSavedViews((vs) => [v, ...vs]);
    toast.success(`"${name}" görünümü kaydedildi.`);
  };
  const renameView = (id: string, name: string) => {
    setSavedViews((vs) => vs.map((v) => (v.id === id ? { ...v, name } : v)));
    toast.success("Görünüm yeniden adlandırıldı.");
  };
  const deleteView = (id: string) => {
    setSavedViews((vs) => vs.filter((v) => v.id !== id));
    if (prefs.defaultViewId === id) setDefaultViewId(null);
    toast.success("Görünüm silindi.");
  };
  const setDefaultView = (id: string) => {
    setSavedViews((vs) => vs.map((v) => ({ ...v, isDefault: v.id === id })));
    setDefaultViewId(id);
    toast.success("Varsayılan görünüm güncellendi.");
  };

  // Apply persisted default-view snapshot once after preferences hydrate.
  const appliedDefaultRef = React.useRef(false);
  React.useEffect(() => {
    if (!appliedDefaultRef.current && initialDefault) {
      applySnapshot(initialDefault.snapshot);
      appliedDefaultRef.current = true;
    }
  }, [initialDefault, applySnapshot]);

  /* -------- Add keyword -------- */
  const handleAdd = (kw: string) => {
    store.addKeyword(kw);
    setAddOpen(false);
    toast.success(`"${kw}" takip listesine eklendi.`);
  };

  /* -------- Selection-driven comparison (2–5 kayıt) --------
     AUXILIARY FULL-DATASET USAGE — JUSTIFIED: a selection can span pages, so
     the compared records are resolved from the workspace snapshot rather than
     the current page. The primary table still reads only server-side rows. */
  const [compareOpen, setCompareOpen] = React.useState(false);
  const compareRows = React.useMemo(
    () => store.records.filter((r) => selectedIds.includes(r.id)).slice(0, SHARED_COMPARISON_MAX),
    [store.records, selectedIds],
  );
  React.useEffect(() => {
    if (compareOpen && selectedIds.length < SHARED_COMPARISON_MIN) setCompareOpen(false);
  }, [compareOpen, selectedIds.length]);

  /* -------- Bulk actions -------- */
  const bulk = buildBulkActions({
    selectedIds,
    store,
    onClearSelection: clearSelection,
    onCompare: () => setCompareOpen(true),
  });

  return (
    <WorkspacePage className={cn(ANALYTICAL_VARIANT, "space-y-5")}>
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow mb-1">ANAHTAR KELİME ZEKÂSI</div>
          <h1 className="font-editorial text-2xl font-semibold tracking-tight sm:text-3xl">
            Takip Edilen Anahtar Kelimeler
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Takip ettiğiniz anahtar kelimelerin sıralamalarını, talep sinyallerini, rekabet düzeyini
            ve büyüme fırsatlarını yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-hairline bg-surface/50 px-3 text-xs"
            onClick={() => toast("Dışa aktarım hazırlanıyor…")}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Dışa Aktar
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-9 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Anahtar Kelime Ekle
              </Button>
            </DialogTrigger>
            <AddKeywordDialog onSave={handleAdd} onCancel={() => setAddOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards records={store.records} viewCounts={viewCounts} />

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        advancedCount={advancedCount}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {/* Built-in view chips */}
      <ViewChips current={viewId} onSelect={setViewId} counts={viewCounts} />

      {/* Grid panel */}
      <Panel className={ANALYTICAL_CARD_FLUSH}>
        {/* Grid toolbar */}
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--border)] px-4 py-3 sm:px-5",
            ANALYTICAL_SECTION_HEAD,
            ANALYTICAL_CONTROLS,
          )}
        >
          <div className="min-w-0">
            <div className="eyebrow mb-0.5">ANAHTAR KELİMELER</div>
            <div className="text-xs text-muted-foreground">
              {totalRecords} anahtar kelimeden <span className="text-foreground">{shownTotal}</span>{" "}
              sonuç gösteriliyor
              <span className="ml-1 hidden sm:inline">
                · Bir kelimeye tıklayarak hızlı önizlemeyi açın
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <DataGridSavedViews<ViewSnapshot>
              views={savedViews}
              currentSnapshot={currentSnapshot}
              onSave={saveView}
              onApply={(v) => {
                applySnapshot(v.snapshot);
                toast(`"${v.name}" uygulandı.`);
              }}
              onRename={renameView}
              onDelete={deleteView}
              onSetDefault={setDefaultView}
            />
            <DataGridDensitySelector value={density} onChange={setDensity} />
            <div className="hidden md:block">
              <DataGridColumnManager
                table={table}
                onReset={() => setVisibility(defaultVisibility)}
              />
            </div>
          </div>
        </div>

        {/* Desktop grid */}
        <div className={cn(ANALYTICAL_TABLE, "hidden md:block")}>
          <SonarDataGrid
            table={table}
            density={density}
            bulkSelection={{
              count: selectedIds.length,
              itemNoun: "anahtar kelime",
              primary: bulk.primary,
              more: bulk.more,
              onClear: clearSelection,
            }}
            onRowClick={(r) => setSelected(r)}
            isRowActive={(r) => selected?.id === r.id}
            emptyTitle="Bu filtrelerle eşleşen anahtar kelime bulunamadı."
            emptyDescription="Filtreleri temizleyerek ya da yeni bir anahtar kelime ekleyerek başlayın."
            onColumnWidthCommit={(columnId, width) => {
              setColumnSizing((prev: ColumnSizingState) => ({ ...prev, [columnId]: width }));
            }}
            emptyActions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-hairline text-xs"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Filtreleri Temizle
                </Button>
                <Button
                  size="sm"
                  className="h-8 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Anahtar Kelime Ekle
                </Button>
              </>
            }
          />
        </div>

        {/* Mobile list */}
        <div className="md:hidden">
          <MobileKeywordList
            rows={table.getRowModel().rows.map((r) => r.original)}
            selectedIds={selectedIds}
            onToggleSelect={(id, v) => setRowSelection((s) => ({ ...s, [id]: v }))}
            onOpen={(r) => setSelected(r)}
            store={store}
          />
        </div>

        {/* Pagination */}
        <DataGridPagination
          table={table}
          totalLabel={`${trackedCount} takip edilen · ${totalRecords} toplam`}
        />
      </Panel>

      {/* Selection-driven comparison — shared surface */}
      <SharedComparisonDialog<KeywordRecord>
        open={compareOpen}
        onOpenChange={setCompareOpen}
        rows={compareRows}
        idOf={(r) => r.id}
        titleOf={(r) => r.kw}
        onRemove={(id) => setRowSelection((sel) => ({ ...sel, [id]: false }))}
        metrics={TRACKED_COMPARE_METRICS}
        summary={buildTrackedCompareSummary(compareRows)}
        chartSeries={buildTrackedCompareChartSeries(compareRows)}
      />

      {/* Detail drawer — unchanged */}
      <KeywordDetailDrawer
        keyword={selected}
        open={selected != null}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      />
    </WorkspacePage>
  );
}

/* ================================================================
   BUILT-IN VIEW CHIPS
================================================================ */
function ViewChips({
  current,
  onSelect,
  counts,
}: {
  current: BuiltInViewId;
  onSelect: (v: BuiltInViewId) => void;
  counts: Record<BuiltInViewId, number>;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-1.5">
        {BUILT_IN_VIEWS.map((v) => {
          const active = current === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition",
                active
                  ? "border-primary/40 bg-primary/12 text-foreground"
                  : "border-hairline bg-surface/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {v.label}
              <span
                className={cn(
                  "rounded px-1.5 text-[10px] tabular-nums",
                  active ? "bg-primary/25 text-primary" : "bg-surface-3 text-muted-foreground",
                )}
              >
                {counts[v.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function countByBuiltInView(rows: KeywordRecord[]): Record<BuiltInViewId, number> {
  const out = {} as Record<BuiltInViewId, number>;
  for (const v of BUILT_IN_VIEWS) out[v.id] = rows.filter(v.test).length;
  return out;
}

/* ================================================================
   MOBILE KEYWORD LIST
================================================================ */
function MobileKeywordList({
  rows,
  selectedIds,
  onToggleSelect,
  onOpen,
  store,
}: {
  rows: KeywordRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string, v: boolean) => void;
  onOpen: (r: KeywordRecord) => void;
  store: ReturnType<typeof useTrackedKeywordsWorkspace>;
}) {
  if (rows.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-xs text-muted-foreground">
        Bu filtrelerle eşleşen anahtar kelime bulunamadı.
      </div>
    );
  }
  const sel = new Set(selectedIds);
  return (
    <ul className="divide-y divide-hairline/60">
      {rows.map((k) => {
        const selected = sel.has(k.id);
        return (
          <li
            key={k.id}
            className={cn("flex items-center gap-2 px-4 py-3", selected && "bg-primary/6")}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={(v) => onToggleSelect(k.id, Boolean(v))}
              className={cn("h-4 w-4", INTERACTIVE_CONTROL, TOUCH_TARGET)}
              aria-label={`${k.kw} seç`}
            />
            <button
              type="button"
              onClick={() => onToggleSelect(k.id, !selected)}
              className="hidden"
              aria-hidden
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                store.toggleFavorite(k.id);
              }}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-md text-muted-foreground",
                INTERACTIVE_CONTROL,
                TOUCH_TARGET,
                k.favorite && "text-[color:var(--warning)]",
              )}
              aria-label="Favori"
            >
              <Star className={cn("h-3.5 w-3.5", k.favorite && "fill-[color:var(--warning)]")} />
            </button>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpen(k)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(k);
                }
              }}
              className="min-w-0 flex-1 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{k.kw}</span>
                {!k.tracked && (
                  <Badge
                    variant="outline"
                    className="h-4 border-hairline px-1 text-[9px] font-normal text-muted-foreground"
                  >
                    takip dışı
                  </Badge>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="tabular-nums text-foreground">
                  {k.rank == null ? "Top 200 dışı" : `#${k.rank}`}
                </span>
                <span>·</span>
                <ChangeCell change={k.change} />
                <span>·</span>
                <span className="tabular-nums">Fırsat {k.opportunity}</span>
                <span>·</span>
                <StatusPill status={k.status} />
              </div>
              <div className="mt-1">
                <DataFreshnessIndicator
                  freshness={freshnessFromMinutes(k.updatedMinutesAgo, {
                    frequency: k.trackingFrequency,
                    isRefreshing: k.isRefreshing,
                  })}
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-2",
                    INTERACTIVE_CONTROL,
                    TOUCH_TARGET,
                  )}
                  aria-label="Satır işlemleri"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[180px] border-hairline bg-background"
              >
                <DropdownMenuItem className="text-xs" onClick={() => onOpen(k)}>
                  Hızlı Önizlemeyi Aç
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs" onClick={() => store.toggleTracked(k.id)}>
                  {k.tracked ? "Takipten Çıkar" : "Takibe Ekle"}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs" onClick={() => store.refreshMany([k.id])}>
                  Veriyi Yenile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        );
      })}
    </ul>
  );
}

/* ================================================================
   BULK ACTIONS
================================================================ */
function buildBulkActions({
  selectedIds,
  store,
  onClearSelection,
  onCompare,
}: {
  selectedIds: string[];
  store: ReturnType<typeof useTrackedKeywordsWorkspace>;
  onClearSelection: () => void;
  onCompare: () => void;
}): { primary: BulkAction[]; more: BulkAction[] } {
  const ids = selectedIds;
  const soon = (l: string) => toast(`${l} yakında etkinleşecek.`);
  return {
    primary: [
      buildComparisonBulkAction({
        selectedCount: ids.length,
        onOpen: onCompare,
        itemNoun: "anahtar kelime",
      }),
      {
        id: "track-on",
        label: "Takibe Ekle",
        icon: Bell,
        onClick: () => {
          store.setTracked(ids, true);
          toast.success(`${ids.length} kelime takibe alındı.`);
        },
      },
      {
        id: "track-off",
        label: "Takipten Çıkar",
        icon: BellOff,
        onClick: () => {
          store.setTracked(ids, false);
          toast.success(`${ids.length} kelime takipten çıkarıldı.`);
        },
      },
      {
        id: "fav-on",
        label: "Favorilere Ekle",
        icon: Star,
        onClick: () => {
          store.setFavorite(ids, true);
          toast.success(`${ids.length} kelime favorilere eklendi.`);
        },
      },
      {
        id: "refresh",
        label: "Veriyi Yenile",
        icon: RefreshCw,
        onClick: () => {
          toast.info(`${ids.length} kelime yenileniyor…`);
          store.refreshMany(ids).then(() => toast.success("Yenileme tamamlandı."));
        },
      },
    ],
    more: [
      {
        id: "fav-off",
        label: "Favorilerden Çıkar",
        icon: Star,
        onClick: () => store.setFavorite(ids, false),
      },
      { id: "tag", label: "Etiketle", icon: Tag, onClick: () => soon("Etiketleme") },
      { id: "group", label: "Gruba Ekle", icon: FolderPlus, onClick: () => soon("Gruplama") },
      { id: "export", label: "Dışa Aktar", icon: Download, onClick: () => soon("Dışa aktarım") },
      {
        id: "remove",
        label: "Listeden Kaldır",
        icon: Trash2,
        danger: true,
        onClick: () => {
          store.removeMany(ids);
          onClearSelection();
          toast.success(`${ids.length} kelime listeden kaldırıldı.`);
        },
      },
    ],
  };
}

function idToName(records: KeywordRecord[], id: string): string {
  return records.find((r) => r.id === id)?.kw ?? id;
}

/* ================================================================
   SUMMARY CARDS  (unchanged copy)
================================================================ */
function SummaryCards({
  records,
  viewCounts,
}: {
  records: KeywordRecord[];
  viewCounts: Record<BuiltInViewId, number>;
}) {
  const summary = useDashboardSummaryData();
  const top10 = records.filter((r) => r.rank != null && r.rank <= 10).length;
  const rising = viewCounts.rising;
  const highOpportunity = records.filter((r) => r.opportunity >= 70).length;
  const criticalLosses = records.filter((r) => r.change <= -5).length;
  const items = [
    {
      label: "Takip Edilenler",
      value: String(viewCounts.tracked),
      note: `Son güncelleme: ${summary.updatedAgo}`,
      tone: "muted" as const,
    },
    {
      label: "İlk 10'daki Anahtar Kelimeler",
      value: String(top10),
      note: "Çekirdek kelimeler",
      tone: "cobalt" as const,
    },
    {
      label: "Yükselen Anahtar Kelimeler",
      value: String(rising),
      note: `${viewCounts.high_opportunity} yeni fırsat`,
      tone: "success" as const,
    },
    {
      label: "Fırsatlar ve Riskler",
      value: `${highOpportunity}`,
      valueSuffix: "yüksek fırsat",
      note: `${criticalLosses} kritik sıra kaybı`,
      tone: "opportunity" as const,
    },
  ];
  const toneMap: Record<string, string> = {
    muted: "text-foreground",
    cobalt: "text-primary",
    success: "text-[color:var(--success)]",
    opportunity: "text-[color:var(--success)]",
  };
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((it) => (
        <Panel
          key={it.label}
          className={cn(ANALYTICAL_CARD, ANALYTICAL_KPI, "flex h-full flex-col")}
        >
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {it.label}
          </div>
          <div
            className={cn(
              "mt-1.5 flex items-baseline gap-2 font-editorial font-semibold tabular-nums",
              toneMap[it.tone],
            )}
          >
            <span className="text-3xl sm:text-4xl">{it.value}</span>
            {it.valueSuffix && (
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {it.valueSuffix}
              </span>
            )}
          </div>
          <div className="mt-1.5 text-[11px] text-muted-foreground">{it.note}</div>
        </Panel>
      ))}
    </div>
  );
}

/* ================================================================
   ADD KEYWORD DIALOG
================================================================ */
function AddKeywordDialog({
  onSave,
  onCancel,
}: {
  onSave: (kw: string) => void;
  onCancel: () => void;
}) {
  const [kw, setKw] = React.useState("");
  /* Country/store are NOT editable here — the keyword is added to the active
     global analysis scope, so the dialog only displays it. */
  const { scope } = useAnalysisScope();
  const scopeCountry = ANALYSIS_MARKETS[scope.countryCode]?.label ?? scope.countryCode;
  const scopeStore = STORE_LABEL[scope.store];
  const [freq, setFreq] = React.useState("Günlük");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = kw.trim();
    if (!value) {
      toast.error("Lütfen bir anahtar kelime girin.");
      return;
    }
    onSave(value);
    setKw("");
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Anahtar Kelime Ekle</DialogTitle>
        <DialogDescription>
          Yeni bir anahtar kelime tanımlayın. Eklediğiniz anahtar kelimeler takip listenize
          kaydedilir.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="kw" className="text-xs">
            Anahtar Kelime
          </Label>
          <Input
            id="kw"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="örn. kalori sayacı"
            autoFocus
            className="h-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Ülke</Label>
            <div className="flex h-9 items-center rounded-md border border-hairline bg-surface-2/60 px-3 text-xs text-muted-foreground">
              {scopeCountry}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Mağaza</Label>
            <div className="flex h-9 items-center rounded-md border border-hairline bg-surface-2/60 px-3 text-xs text-muted-foreground">
              {scopeStore}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Ülke ve mağaza üst çubuktaki analiz kapsamından gelir.
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs">Takip Sıklığı</Label>
          <Select value={freq} onValueChange={setFreq}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Günlük", "3 Günde Bir", "Haftalık", "Aylık", "İsteğe Bağlı"].map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 border-hairline text-xs"
            onClick={onCancel}
          >
            İptal
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-9 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
          >
            Kaydet
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ================================================================
   FILTER BAR
================================================================ */
function FilterBar({
  filters,
  setFilters,
  advancedCount,
  onReset,
}: {
  filters: KeywordFilters;
  setFilters: React.Dispatch<React.SetStateAction<KeywordFilters>>;
  advancedCount: number;
  onReset: () => void;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [advOpen, setAdvOpen] = React.useState(false);

  const Primary = (
    <>
      <FilterSelect
        label="Durum"
        value={filters.opp}
        onChange={(v) => setFilters((f) => ({ ...f, opp: v as OppFilter }))}
        options={FILTER_OPTIONS.opp}
      />
      <FilterSelect
        label="Sıralama Hareketi"
        value={filters.movement}
        onChange={(v) => setFilters((f) => ({ ...f, movement: v as Movement }))}
        options={FILTER_OPTIONS.movement}
      />
      <FilterSelect
        label="Fırsat Seviyesi"
        value={filters.oppLevel}
        onChange={(v) => setFilters((f) => ({ ...f, oppLevel: v as OppLevel }))}
        options={FILTER_OPTIONS.oppLevel}
      />
    </>
  );

  const AdvancedContent = (
    <div className="space-y-4">
      <RangePair
        label="Sıra Aralığı"
        min={1}
        max={200}
        step={1}
        from={filters.rankMin}
        to={filters.rankMax}
        onChange={(from, to) => setFilters((f) => ({ ...f, rankMin: from, rankMax: to }))}
      />
      <RangePair
        label="Zorluk Aralığı"
        min={0}
        max={100}
        step={1}
        from={filters.diffMin}
        to={filters.diffMax}
        onChange={(from, to) => setFilters((f) => ({ ...f, diffMin: from, diffMax: to }))}
      />
      <RangePair
        label="Tahmini Aranma Hacmi"
        min={0}
        max={100}
        step={1}
        from={filters.volMin}
        to={filters.volMax}
        onChange={(from, to) => setFilters((f) => ({ ...f, volMin: from, volMax: to }))}
      />
      <RangePair
        label="Alaka Aralığı"
        min={0}
        max={100}
        step={1}
        from={filters.relMin}
        to={filters.relMax}
        onChange={(from, to) => setFilters((f) => ({ ...f, relMin: from, relMax: to }))}
      />
      <StackedSelect
        label="Takip Durumu"
        value={filters.tracked}
        onChange={(v) => setFilters((f) => ({ ...f, tracked: v as KeywordFilters["tracked"] }))}
        options={FILTER_OPTIONS.tracked}
      />
      <StackedSelect
        label="Favori Durumu"
        value={filters.favorite}
        onChange={(v) => setFilters((f) => ({ ...f, favorite: v as KeywordFilters["favorite"] }))}
        options={FILTER_OPTIONS.favorite}
      />
      <StackedSelect
        label="Veri Güncelliği"
        value={filters.freshness}
        onChange={(v) => setFilters((f) => ({ ...f, freshness: v as KeywordFilters["freshness"] }))}
        options={FILTER_OPTIONS.freshness}
      />
    </div>
  );

  return (
    <Panel className={cn(ANALYTICAL_CARD_DENSE, ANALYTICAL_CONTROLS)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full md:w-60 md:flex-none md:min-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Anahtar kelime ara…"
            className="h-9 border-hairline bg-surface/40 pl-8 text-xs"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, q: "" }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {Primary}
          <Popover open={advOpen} onOpenChange={setAdvOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs"
              >
                <Filter className="h-3.5 w-3.5" />
                Gelişmiş Filtreler
                {advancedCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-[10px] text-primary">
                    {advancedCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 border-hairline bg-background p-4">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Gelişmiş Filtreler
              </div>
              {AdvancedContent}
            </PopoverContent>
          </Popover>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs md:hidden"
            >
              <Filter className="h-3.5 w-3.5" />
              Filtreler
              {advancedCount > 0 && (
                <span className="rounded-full bg-primary/20 px-1.5 text-[10px] text-primary">
                  {advancedCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto bg-background">
            <SheetHeader>
              <SheetTitle>Filtreler</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <StackedSelect
                  label="Durum"
                  value={filters.opp}
                  onChange={(v) => setFilters((f) => ({ ...f, opp: v as OppFilter }))}
                  options={FILTER_OPTIONS.opp}
                />
                <StackedSelect
                  label="Sıralama Hareketi"
                  value={filters.movement}
                  onChange={(v) => setFilters((f) => ({ ...f, movement: v as Movement }))}
                  options={FILTER_OPTIONS.movement}
                />
                <StackedSelect
                  label="Fırsat Seviyesi"
                  value={filters.oppLevel}
                  onChange={(v) => setFilters((f) => ({ ...f, oppLevel: v as OppLevel }))}
                  options={FILTER_OPTIONS.oppLevel}
                />
              </div>
              <Separator className="bg-hairline" />
              {AdvancedContent}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 border-hairline text-xs"
                  onClick={onReset}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Sıfırla
                </Button>
                <Button
                  size="sm"
                  className="h-9 flex-1 bg-primary text-xs text-primary-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Uygula
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-9 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filtreleri Temizle</span>
        </Button>
      </div>
    </Panel>
  );
}

function FilterSelect<V extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: V;
  onChange: (v: V) => void;
  options: readonly FilterOption<V>[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v as V)}>
        <SelectTrigger className="h-9 min-w-[150px] border-hairline bg-surface/40 text-xs">
          <SelectValue placeholder="Tümü" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
function StackedSelect<V extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: V;
  onChange: (v: V) => void;
  options: readonly FilterOption<V>[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as V)}>
        <SelectTrigger className="h-9 w-full border-hairline bg-surface/40 text-xs">
          <SelectValue placeholder="Tümü" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
function RangePair({
  label,
  min,
  max,
  step,
  from,
  to,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  from: number;
  to: number;
  onChange: (from: number, to: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">
          {from} – {to}
        </span>
      </Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={from}
          onChange={(e) => onChange(Math.max(min, Math.min(to, Number(e.target.value) || min)), to)}
          className="h-9 flex-1 border-hairline bg-surface/40 text-xs tabular-nums"
        />
        <span className="text-xs text-muted-foreground">–</span>
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={to}
          onChange={(e) =>
            onChange(from, Math.min(max, Math.max(from, Number(e.target.value) || max)))
          }
          className="h-9 flex-1 border-hairline bg-surface/40 text-xs tabular-nums"
        />
      </div>
    </div>
  );
}

/* ================================================================
   KEYWORD DETAIL DRAWER (unchanged behavior)
================================================================ */
function KeywordDetailDrawer({
  keyword,
  open,
  onOpenChange,
}: {
  keyword: KeywordRecord | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "!max-w-none sm:!max-w-none",
          "w-screen sm:w-[92vw] lg:w-[min(880px,calc(100vw-48px))]",
          "flex flex-col gap-0 border-l border-hairline bg-background p-0",
        )}
      >
        {keyword && <DrawerBody kw={keyword} onClose={() => onOpenChange(false)} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({ kw, onClose }: { kw: KeywordRecord; onClose: () => void }) {
  const navigate = useNavigate();
  const summary = useDashboardSummaryData();
  const history = React.useMemo(() => getKeywordHistory(kw.kw, kw.rank, kw.change), [kw]);
  const summary30 = React.useMemo(() => summarizeRange(history, 30), [history]);
  const cov = coverageForKeyword(kw.kw);
  const isKalori = kw.kw === "kalori sayacı";

  const decision = isKalori
    ? "Kısa vadede yeni bir anahtar kelime eklemek yerine, mevcut “kalori sayacı” kapsamını güçlendirmek daha yüksek getirili görünüyor."
    : `${STATUS_EXPLAIN[kw.status]} Mevcut sıralamayı korumak için mağaza bilgileri kapsamınızı gözden geçirin.`;

  const whyMatters = isKalori
    ? "Talep skoru 78 ile yüksek, zorluk 54 uygulamanızın gücüyle uyumlu ve alaka düzeyi 94 — bu üç sinyal aynı yönde okuyor."
    : `Talep ${kw.volume}, zorluk ${kw.difficulty} ve alaka düzeyi ${kw.relevance} birlikte değerlendirildiğinde bu anahtar kelime ${kw.status.toLowerCase()} olarak sınıflandırıldı.`;

  const nextAction = isKalori
    ? "Alt başlıkta “kalori sayacı” tam eşleşmesini öne çıkarın ve anahtar kelime alanında gereksiz varyasyonları temizleyin."
    : `${kw.kw} varyasyonlarını mağaza metninde değerlendirin ve ilk 10 rakibin başlık kullanımını inceleyin.`;

  return (
    <>
      <div className="border-b border-hairline px-6 pt-6 pb-4">
        <div className="eyebrow mb-1">SEÇİLİ ANAHTAR KELİME</div>
        <SheetTitle className="font-editorial text-2xl font-semibold tracking-tight">
          {kw.kw}
        </SheetTitle>
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          {summary.store} · {summary.country} · {summary.app.split(" — ")[0]}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusPill status={kw.status} />
          <span className="inline-flex items-center gap-1 rounded-md border border-hairline bg-surface/40 px-2 py-0.5 text-[11px] tabular-nums">
            <span className="text-muted-foreground">Sıra:</span>
            <span className="font-medium">{rankLabel(kw.rank)}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-hairline bg-surface/40 px-2 py-0.5 text-[11px] tabular-nums">
            <span className="text-muted-foreground">Fırsat:</span>
            <span className="font-medium">{kw.opportunity}/100</span>
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <section>
          <div className="eyebrow mb-2">KARAR ÖZETİ</div>
          <div className="rounded-lg border border-primary/25 bg-primary/8 p-4">
            <p className="text-sm leading-relaxed">{decision}</p>
          </div>
        </section>

        <section>
          <BaseTimeSeriesChart history={history} defaultRange={30} />
        </section>

        <section>
          <div className="eyebrow mb-2">NE DEĞİŞTİ?</div>
          <ul className="space-y-2 text-sm">
            {history.events
              .slice(-3)
              .reverse()
              .map((e: RankEvent) => (
                <li
                  key={e.date + e.title}
                  className="flex items-start gap-3 rounded-lg border border-hairline bg-surface/40 px-3 py-2.5"
                >
                  <div
                    className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      e.type === "metadata"
                        ? "bg-primary"
                        : e.type === "competitor"
                          ? "bg-[color:var(--warning)]"
                          : "bg-muted-foreground/60",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium">{e.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{e.description}</div>
                  </div>
                  <div className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {new Date(e.date).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </li>
              ))}
            {history.events.length === 0 && (
              <li className="rounded-lg border border-hairline bg-surface/40 px-3 py-2.5 text-[12px] text-muted-foreground">
                Son dönem için kayıtlı bir mağaza veya rakip olayı bulunmuyor.
              </li>
            )}
          </ul>
        </section>

        <section>
          <div className="eyebrow mb-2">NEDEN ÖNEMLİ?</div>
          <p className="text-sm leading-relaxed text-muted-foreground">{whyMatters}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricTile label="Aranma Hacmi" value={String(kw.volume)} suffix="/100" />
            <MetricTile label="Zorluk" value={String(kw.difficulty)} suffix="/100" />
            <MetricTile label="Alaka" value={String(kw.relevance)} suffix="/100" />
            <MetricTile
              label="Fırsat"
              value={String(kw.opportunity)}
              suffix="/100"
              tone="success"
            />
          </div>
        </section>

        <section>
          <div className="eyebrow mb-2">ÖNERİLEN SONRAKİ AKSİYON</div>
          <div className="rounded-lg border border-hairline bg-surface/40 p-4">
            <p className="text-sm leading-relaxed">{nextAction}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Uygulama Adı", status: cov.appName },
                { label: "Alt Başlık", status: cov.subtitle },
                { label: "Anahtar Kelime Alanı", status: cov.keywordField },
                { label: "Açıklama", status: cov.description },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between gap-2 rounded-md border border-hairline bg-background/40 px-2.5 py-1.5"
                >
                  <span className="truncate text-[11px] text-muted-foreground">{f.label}</span>
                  <span
                    className={cn(
                      "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1",
                      COVERAGE_TONE[f.status],
                    )}
                  >
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-3 rounded-lg border border-[color:var(--violet)]/25 bg-accent-brand/8 p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-brand/15 ring-1 ring-[color:var(--violet)]/30">
              <Sparkles className="h-4 w-4 text-[color:var(--violet)]" />
            </div>
            <div className="min-w-0">
              <div className="eyebrow mb-1">YAPAY ZEKÂ YORUMU</div>
              <p className="text-sm leading-relaxed">
                {isKalori
                  ? "Mevcut veriler, yeni bir anahtar kelime eklemekten önce “kalori sayacı” için mağaza bilgileri kapsamını ve ilk 10’daki rakiplerin başlık kullanımını incelemenin daha mantıklı olduğunu gösteriyor."
                  : `“${kw.kw}” için mevcut sinyaller ${kw.status.toLowerCase()} kategorisiyle uyumlu. Önce mağaza kapsamını, sonra rakip başlıklarını inceleyin.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  {
                    l: "Mevcut Sıra",
                    v: rankLabel(summary30.currentRank ?? kw.rank),
                    tone: "muted",
                  },
                  { l: "Aranma Hacmi", v: String(kw.volume), tone: "cobalt" },
                  { l: "Zorluk", v: String(kw.difficulty), tone: "amber" },
                  { l: "Alaka", v: String(kw.relevance), tone: "violet" },
                  { l: "Fırsat", v: String(kw.opportunity), tone: "success" },
                ].map((c) => (
                  <span
                    key={c.l}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      c.tone === "cobalt" && "border-primary/30 text-primary bg-primary/8",
                      c.tone === "amber" &&
                        "border-[color:var(--warning)]/30 text-[color:var(--warning)] bg-[color:var(--warning)]/8",
                      c.tone === "violet" &&
                        "border-[color:var(--violet)]/30 text-[color:var(--violet)] bg-accent-brand/8",
                      c.tone === "success" &&
                        "border-[color:var(--success)]/30 text-[color:var(--success)] bg-[color:var(--success)]/8",
                      c.tone === "muted" && "border-hairline text-foreground",
                    )}
                  >
                    <span className="uppercase tracking-wide text-muted-foreground">{c.l}</span>
                    <span className="tabular-nums">{c.v}</span>
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-start gap-2 text-[11px] text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Yapay zekâ yeni metrik üretmez; doğrulanmış verileri yorumlar.</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="border-t border-hairline bg-background/95 backdrop-blur px-6 py-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs"
            onClick={() => toast("Mağaza Çalışma Alanı yakında etkinleşecek.")}
          >
            Mağaza Bilgilerine Git
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs"
            onClick={() => toast("Rakip incelemesi yakında etkinleşecek.")}
          >
            Rakipleri İncele
          </Button>
          <Button
            size="sm"
            className="h-9 bg-primary px-4 text-xs text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              onClose();
              navigate({
                to: "/dashboard/keywords/inspect/$keyword",
                params: { keyword: kwSlug(kw.kw) },
              });
            }}
          >
            Detaylı Analizi Aç
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  );
}

function MetricTile({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: "success";
}) {
  return (
    <div className="rounded-md border border-hairline bg-background/40 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-editorial text-base font-semibold tabular-nums",
          tone === "success" && "text-[color:var(--success)]",
        )}
      >
        {value}
        <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

/* ---------------- Comparison metric matrix (shared dialog) ---------------- */

const fmtRank = (v: number | null) => (v == null ? "—" : `#${v}`);
const fmtDelta = (v: number | null) => (v == null ? "—" : v === 0 ? "0" : v > 0 ? `+${v}` : `${v}`);

const TRACKED_COMPARE_METRICS: SharedCompareMetric<KeywordRecord>[] = [
  {
    id: "currentRank",
    label: "Mevcut Sıra",
    value: (r) => (typeof r.rank === "number" ? r.rank : null),
    render: (r) => fmtRank(typeof r.rank === "number" ? r.rank : null),
    lowerBetter: true,
  },
  {
    id: "rankChange",
    label: "Son Değişim",
    value: (r) => (typeof r.change === "number" ? r.change : null),
    render: (r) => fmtDelta(typeof r.change === "number" ? r.change : null),
    higherBetter: true,
  },
  {
    id: "sevenDayChange",
    label: "7 Günlük Değişim",
    value: (r) => r.sevenDayChange,
    render: (r) => fmtDelta(r.sevenDayChange),
    higherBetter: true,
  },
  {
    id: "thirtyDayChange",
    label: "30 Günlük Değişim",
    value: (r) => thirtyDayChangeOf(r),
    render: (r) => fmtDelta(thirtyDayChangeOf(r)),
    higherBetter: true,
  },
  {
    id: "estimatedVolume",
    label: "Tahmini Aranma Hacmi",
    value: (r) => r.volume ?? null,
    render: (r) => (r.volume == null ? "—" : String(r.volume)),
    higherBetter: true,
  },
  {
    id: "difficulty",
    label: "Zorluk",
    value: (r) => r.difficulty ?? null,
    render: (r) => (r.difficulty == null ? "—" : String(r.difficulty)),
    lowerBetter: true,
  },
  {
    id: "opportunity",
    label: "Fırsat Skoru",
    value: (r) => r.opportunity ?? null,
    render: (r) => (r.opportunity == null ? "—" : String(r.opportunity)),
    higherBetter: true,
  },
  {
    id: "bestRank",
    label: "En İyi Sıra",
    value: (r) => r.bestRank,
    render: (r) => fmtRank(r.bestRank),
    lowerBetter: true,
  },
  {
    id: "worstRank",
    label: "En Kötü Sıra",
    value: (r) => r.worstRank,
    render: (r) => fmtRank(r.worstRank),
    lowerBetter: true,
  },
  {
    id: "rankingCompetitorCount",
    label: "Sıralamada Bulunan Rakip Sayısı",
    value: (r) => r.competitorsCount,
    render: (r) => String(r.competitorsCount),
  },
  {
    id: "titleCompetition",
    label: "Başlık Rekabeti",
    value: () => null,
    render: (r) => r.titleCompetition,
  },
  {
    id: "trackingFrequency",
    label: "Takip Sıklığı",
    value: () => null,
    render: (r) => r.trackingFrequency,
  },
  {
    id: "updatedMinutesAgo",
    label: "Son Güncelleme",
    value: (r) => r.updatedMinutesAgo,
    render: (r) => `${r.updatedMinutesAgo} dk önce`,
    lowerBetter: true,
  },
];

/** 30-day rank delta derived from the shared rank-history source. */
function thirtyDayChangeOf(row: KeywordRecord): number | null {
  const history = getKeywordHistory(
    row.kw,
    typeof row.rank === "number" ? row.rank : null,
    row.change,
  );
  const points = history.points.filter((p) => typeof p.rank === "number");
  if (points.length < 2) return null;
  const last = points[points.length - 1].rank as number;
  const ref = (points[Math.max(0, points.length - 31)].rank as number) ?? last;
  // Improvement (rank going down) is positive.
  return ref - last;
}

function buildTrackedCompareSummary(rows: KeywordRecord[]): SharedComparisonSummaryItem[] {
  if (rows.length < 2) return [];
  const byBest = <V,>(pick: (r: KeywordRecord) => V | null, better: (a: V, b: V) => boolean) => {
    let best: { r: KeywordRecord; v: V } | null = null;
    rows.forEach((r) => {
      const v = pick(r);
      if (v == null) return;
      if (!best || better(v, best.v)) best = { r, v };
    });
    return best as { r: KeywordRecord; v: V } | null;
  };
  const bestRank = byBest<number>(
    (r) => (typeof r.rank === "number" ? r.rank : null),
    (a, b) => a < b,
  );
  const bestOpp = byBest<number>(
    (r) => r.opportunity ?? null,
    (a, b) => a > b,
  );
  const easiest = byBest<number>(
    (r) => r.difficulty ?? null,
    (a, b) => a < b,
  );
  const out: SharedComparisonSummaryItem[] = [];
  if (bestRank) out.push({ label: "En İyi Sıra", title: bestRank.r.kw, value: `#${bestRank.v}` });
  if (bestOpp)
    out.push({
      label: "En Yüksek Fırsat",
      title: bestOpp.r.kw,
      value: String(bestOpp.v),
      tone: "success",
    });
  if (easiest)
    out.push({
      label: "En Düşük Zorluk",
      title: easiest.r.kw,
      value: String(easiest.v),
      tone: "warning",
    });
  return out;
}

function buildTrackedCompareChartSeries(
  rows: KeywordRecord[],
): SharedComparisonChartSeries<KeywordRecord>[] {
  // Shared builder — identical semantics as the research workspace.
  return buildKeywordCompareSeries(rows, (row) => ({
    id: row.id,
    label: row.kw,
    currentRank: typeof row.rank === "number" ? row.rank : null,
    change: row.change,
  }));
}
