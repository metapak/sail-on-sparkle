import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import {
  Search,
  Filter,
  X,
  Sparkles,
  Info,
  Bell,
  BadgePlus,
  GitCompare,
  Bookmark,
  History,
  RotateCcw,
  Radar,
  Store,
  Users,
  LayoutGrid,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Pencil,
  ExternalLink,
  Download,
  Check,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useReactTable,
  getCoreRowModel,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type ColumnSizingState,
  type ColumnPinningState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Panel,
  SonarDataGrid,
  DataGridColumnManager,
  DataGridDensitySelector,
  DataGridPagination,
  type Density,
  type BulkAction,
  buildComparisonBulkAction,
  SharedComparisonDialog,
  buildKeywordCompareSeries,
  type SharedComparisonSummaryItem,
  WorkspacePage,
} from "@/components/shared";
import {
  ANALYTICAL_VARIANT,
  ANALYTICAL_CARD,
  ANALYTICAL_CARD_FLUSH,
  ANALYTICAL_CONTROLS,
  ANALYTICAL_STATE,
  ANALYTICAL_TABLE,
} from "@/design/analytical";

import {
  makeResearchColumns,
  getDefaultColumnVisibility,
  getDefaultColumnSizing,
  DEFAULT_COLUMN_PINNING,
  DEFAULT_FULL_COLUMN_ORDER,
  DEFAULT_DATA_COLUMN_ORDER,
  UTILITY_COLUMN_IDS,
  type ResearchColumnHandlers,
} from "@/lib/research/columns";
import { useResearchWorkspace } from "@/hooks/queries/use-research-workspace";
import {
  useKeywordResearchPaginated,
  type KeywordResearchListRequest,
} from "@/hooks/queries/use-keyword-research";
import { RESEARCH_SOURCES, DEFAULT_SOURCES, SOURCE_MAP } from "@/lib/research/data";
import {
  BUILT_IN_VIEWS,
  DEFAULT_FILTERS,
  FILTER_OPTIONS,
  countAdvancedFilters,
  ResearchStorage,
  type BuiltInViewId,
  type ResearchFilters,
} from "@/lib/research/views";
import {
  ANALYSIS_MARKETS,
  STORE_LABEL,
  getApplication,
  useAnalysisScope,
  useScopeIdentityEffect,
} from "@/scope";
import type { ResearchIntent } from "@/hooks/queries/use-research-workspace";
import type { ResearchMethod, ResearchRecord, ResearchSourceId } from "@/lib/research/types";

/* ================================================================ */

export const Route = createFileRoute("/dashboard/keywords/research")({
  head: () => ({
    meta: [
      { title: "Anahtar Kelime Araştırması — Sonar Dashboard" },
      {
        name: "description",
        content:
          "Yeni anahtar kelimeleri keşfedin; talep, rekabet, alaka ve fırsat sinyallerini birlikte değerlendirin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResearchPage,
});

const COMPARISON_MIN = 2;
const COMPARISON_MAX = 5;

/* ---------------- Context fixtures ---------------- */
const AVAILABLE_APPS = ["FitLoop", "CalorieMate", "StepDaily"];
const AVAILABLE_COMPETITORS = ["FitTrack Pro", "CalorieMate", "StepDaily", "HealthPilot"];
const AVAILABLE_CATEGORIES = ["Sağlık ve Fitness", "Yaşam Tarzı", "Eğitim", "Yeme İçme"];

const METHOD_LABEL: Record<ResearchMethod, string> = {
  keyword: "Anahtar Kelime ile",
  app: "Uygulama ile",
  competitor: "Rakip ile",
  category: "Kategori ile",
};
const METHOD_ICON: Record<ResearchMethod, React.ComponentType<{ className?: string }>> = {
  keyword: Radar,
  app: Store,
  competitor: Users,
  category: LayoutGrid,
};

/* ================================================================
   PAGE
================================================================ */
function ResearchPage() {
  const store = useResearchWorkspace();
  const navigate = useNavigate();
  /* Authoritative analysis scope — never duplicated in local state. */
  const { scope } = useAnalysisScope();
  const scopeApp = getApplication(scope.applicationId);
  const scopeLabels = {
    app: scopeApp?.name ?? scope.applicationId,
    store: STORE_LABEL[scope.store],
    country: ANALYSIS_MARKETS[scope.countryCode]?.label ?? scope.countryCode,
    language: scope.marketLocale.toUpperCase(),
  };

  /* ---- Method + source configuration ---- */
  const [method, setMethod] = React.useState<ResearchMethod>("keyword");
  const [sources, setSources] = React.useState<ResearchSourceId[]>(DEFAULT_SOURCES);

  /* ---- Input state per method ---- */
  const [seedInput, setSeedInput] = React.useState("");
  const seedInputRef = React.useRef("");
  const [seeds, setSeeds] = React.useState<string[]>([]);
  const [selectedApp, setSelectedApp] = React.useState(scopeLabels.app);
  const [selectedCompetitors, setSelectedCompetitors] = React.useState<string[]>(["FitTrack Pro"]);
  const [selectedCategory, setSelectedCategory] = React.useState(AVAILABLE_CATEGORIES[0]);
  const [seedError, setSeedError] = React.useState<string | null>(null);

  /* ---- View + filters ---- */
  const [viewId, setViewId] = React.useState<BuiltInViewId>("all");
  const [filters, setFilters] = React.useState<ResearchFilters>(DEFAULT_FILTERS);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "opportunity", desc: true }]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);

  /* ---- Persisted UI state ---- */
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [visibility, setVisibility] = React.useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>(DEFAULT_FULL_COLUMN_ORDER);
  const [columnPinning, setColumnPinning] =
    React.useState<ColumnPinningState>(DEFAULT_COLUMN_PINNING);

  /* ---- Modes ---- */
  const [focusMode, setFocusMode] = React.useState(false);
  const [builderCollapsed, setBuilderCollapsed] = React.useState(false);

  /* ---- Sheets / modals ---- */
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [listsOpen, setListsOpen] = React.useState(false);
  const [compareOpen, setCompareOpen] = React.useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [selectedForPreview, setSelectedForPreview] = React.useState<ResearchRecord | null>(null);

  /** Scope switch → drop row-bound state (selection, preview, pagination). */
  useScopeIdentityEffect(() => {
    setRowSelection({});
    setSelectedForPreview(null);
    setPageIndex(0);
    setCompareOpen(false);
  });

  /* ---- Column-op handlers (used inside header menus) ---- */
  const moveColumn = React.useCallback(
    (id: string, target: "leftmost" | "left" | "right" | "rightmost") => {
      setColumnOrder((prev) => {
        const list = prev.length ? [...prev] : [...DEFAULT_FULL_COLUMN_ORDER];
        const start = list.indexOf("favorite") + 1;
        const end = list.indexOf("_actionsSpacer");
        const dataZone = list.slice(start, end);
        const from = dataZone.indexOf(id);
        if (from < 0) return prev;
        let to = from;
        if (target === "leftmost") to = 0;
        else if (target === "left") to = Math.max(0, from - 1);
        else if (target === "right") to = Math.min(dataZone.length - 1, from + 1);
        else if (target === "rightmost") to = dataZone.length - 1;
        if (to === from) return prev;
        const [moved] = dataZone.splice(from, 1);
        dataZone.splice(to, 0, moved);
        return [...list.slice(0, start), ...dataZone, ...list.slice(end)];
      });
    },
    [],
  );

  const pinColumn = React.useCallback((id: string, side: "left" | false) => {
    setColumnPinning((prev) => {
      const left = [...(prev.left ?? [])].filter((x) => x !== id);
      const right = [...(prev.right ?? [])];
      if (side === "left") left.push(id);
      return { left, right };
    });
  }, []);

  const autoFitColumn = React.useCallback((id: string) => {
    setColumnSizing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  /* ---- Column cell handlers ---- */
  const handlers: ResearchColumnHandlers = React.useMemo(
    () => ({
      toggleFavorite: (id) => store.toggleFavorite(id),
      addTracking: (id) => {
        const r = store.results.find((x) => x.id === id);
        if (r && r.trackingStatus === "tracked") return;
        store.setTracking([id], "tracked");
        if (r) toast.success(`"${r.keyword}" takibe eklendi.`);
      },
      removeTracking: (id) => {
        const r = store.results.find((x) => x.id === id);
        if (r && r.trackingStatus !== "tracked") return;
        store.setTracking([id], "none");
        if (r) toast.success(`"${r.keyword}" takipten çıkarıldı.`);
      },
      addMetadataCandidate: (id) => {
        const r = store.results.find((x) => x.id === id);
        if (!r) return;
        if (r.metadataStatus === "in_use") {
          toast.info(`"${r.keyword}" halihazırda mağaza bilgilerinde kullanılıyor.`);
          return;
        }
        store.setMetadata([id], "candidate");
        toast.success(`"${r.keyword}" mağaza bilgileri aday listesine eklendi.`);
      },
      openPreview: (r) => setSelectedForPreview(r),
      openInspector: (r) =>
        navigate({
          to: "/dashboard/keywords/inspect/$keyword",
          params: { keyword: r.id },
          search: (prev: Record<string, unknown>) => prev,
        }),
      moveColumn,
      pinColumn,
      autoFitColumn,
    }),
    [store, navigate, moveColumn, pinColumn, autoFitColumn],
  );

  const columns = React.useMemo(() => makeResearchColumns(handlers), [handlers]);
  const defaultVisibility = React.useMemo(() => getDefaultColumnVisibility(columns), [columns]);
  const defaultSizing = React.useMemo(() => getDefaultColumnSizing(columns), [columns]);

  /* Hydrate persisted UI state */
  React.useEffect(() => {
    const d = ResearchStorage.readDensity();
    if (d) setDensity(d);
    const v = ResearchStorage.readVisibility();
    setVisibility(v ? { ...defaultVisibility, ...v } : defaultVisibility);
    const s = ResearchStorage.readSizing();
    if (s) setColumnSizing(s);
    const o = ResearchStorage.readOrder();
    if (o && o.length) {
      // Ensure new columns get appended.
      const missing = DEFAULT_FULL_COLUMN_ORDER.filter((id) => !o.includes(id));
      setColumnOrder([...o, ...missing]);
    }
    const p = ResearchStorage.readPinning();
    if (p) setColumnPinning({ left: p.left ?? [], right: p.right ?? [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    ResearchStorage.writeDensity(density);
  }, [density]);
  React.useEffect(() => {
    if (Object.keys(visibility).length) ResearchStorage.writeVisibility(visibility);
  }, [visibility]);
  React.useEffect(() => {
    ResearchStorage.writeOrder(columnOrder);
  }, [columnOrder]);
  React.useEffect(() => {
    ResearchStorage.writePinning(columnPinning);
  }, [columnPinning]);

  /* ---- Filtered rows ---- */
  /* ---- Server-side-ready request ---- */
  const advancedCount = countAdvancedFilters(filters);

  const paginationRequest = React.useMemo<KeywordResearchListRequest | null>(
    () =>
      store.context
        ? {
            context: store.context,
            page: pageIndex + 1,
            pageSize,
            search: filters.q?.trim() || undefined,
            sorting: sorting.map((s) => ({ id: s.id, desc: s.desc })),
            filters: { ...filters, q: "" } as unknown as Record<string, unknown>,
            viewId,
          }
        : null,
    [store.context, pageIndex, pageSize, filters, sorting, viewId],
  );

  const pagedQuery = useKeywordResearchPaginated(paginationRequest);
  const pagedRows = React.useMemo(
    () => (pagedQuery.data?.items ?? []) as unknown as ResearchRecord[],
    [pagedQuery.data],
  );
  const total = pagedQuery.data?.total ?? 0;
  const totalPages = pagedQuery.data?.totalPages ?? 1;

  // Reset to the first page when search / filters / view / sorting change.
  React.useEffect(() => {
    setPageIndex(0);
  }, [filters, viewId, sorting, store.context]);

  // Keep the current page valid after mutations shrink the result set.
  React.useEffect(() => {
    if (!pagedQuery.isFetching && pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [pageIndex, totalPages, pagedQuery.isFetching]);

  /* ---- Table (manual pagination/sorting/filtering) ---- */
  const table = useReactTable<ResearchRecord>({
    data: pagedRows,
    columns,
    getRowId: (r) => r.id,
    state: {
      sorting,
      columnVisibility: visibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
      columnPinning,
      columnSizing,
      columnOrder,
    },
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
    columnResizeDirection: "ltr",
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    rowCount: total,
    onColumnSizingChange: setColumnSizing,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (u) => {
      const next = typeof u === "function" ? u({ pageIndex, pageSize }) : u;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  // Sizing changes only commit on pointer release from our custom resize handler,
  // so persisting on every column-sizing state change is safe (no per-frame writes).
  React.useEffect(() => {
    ResearchStorage.writeSizing(columnSizing);
  }, [columnSizing]);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r) => r.id);
  const selectedRecords = selectedRows.map((r) => r.original);
  const compareRows = selectedRecords.slice(0, COMPARISON_MAX);

  /* ---- Reorder via drag ---- */
  const handleDragReorder = React.useCallback((draggedId: string, targetId: string) => {
    if (UTILITY_COLUMN_IDS.has(draggedId) || UTILITY_COLUMN_IDS.has(targetId)) return;
    setColumnOrder((prev) => {
      const list = prev.length ? [...prev] : [...DEFAULT_FULL_COLUMN_ORDER];
      const from = list.indexOf(draggedId);
      const to = list.indexOf(targetId);
      if (from < 0 || to < 0) return prev;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return list;
    });
  }, []);

  /* ---- Column-manager delta move ---- */
  const moveByDelta = React.useCallback(
    (id: string, delta: number) => {
      moveColumn(id, delta < 0 ? "left" : "right");
    },
    [moveColumn],
  );

  /* ---- Summary counts (auxiliary full-dataset usage) ----
     JUSTIFIED: the summary cards and the active-query strip describe the whole
     research result set (total / high opportunity / low difficulty / tracked /
     in metadata), which cannot be derived from a single page. The table itself
     consumes only the paginated server-style response. */
  const summary = React.useMemo(() => {
    const rows = store.results;

    return {
      total: rows.length,
      highOpp: rows.filter((r) => r.opportunity >= 70).length,
      lowDiff: rows.filter((r) => r.difficulty < 40).length,
      tracked: rows.filter((r) => r.trackingStatus === "tracked").length,
      inMeta: rows.filter((r) => r.metadataStatus !== "not_used").length,
    };
  }, [store.results]);

  /* ---- Query submission ---- */
  const submit = React.useCallback(() => {
    const pendingKeywordSeeds = Array.from(
      new Set([
        ...seeds,
        ...seedInputRef.current
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean),
      ]),
    );
    const intent: ResearchIntent = {
      method,
      seeds:
        method === "keyword"
          ? pendingKeywordSeeds
          : method === "app"
            ? [selectedApp]
            : method === "competitor"
              ? selectedCompetitors
              : [selectedCategory],
      sources,
    };
    if (method === "keyword" && pendingKeywordSeeds.length === 0) {
      setSeedError("Araştırmak için en az bir anahtar kelime ekleyin.");
      return;
    }
    if (method === "competitor" && selectedCompetitors.length === 0) {
      toast.warning("En az bir rakip seçin.");
      return;
    }
    setSeedError(null);
    if (method === "keyword") {
      setSeeds(pendingKeywordSeeds);
      seedInputRef.current = "";
      setSeedInput("");
    }
    store.runQuery(intent);
    setRowSelection({});
    setPageIndex(0);
    setBuilderCollapsed(true);
  }, [method, seeds, selectedApp, selectedCompetitors, selectedCategory, sources, store]);

  const runExample = React.useCallback(
    (preset: "kalori" | "fitloop" | "competitors" | "category") => {
      if (preset === "kalori") {
        setMethod("keyword");
        setSeeds(["kalori sayacı"]);
        seedInputRef.current = "";
        setSeedInput("");
        setTimeout(() => {
          store.runQuery({ method: "keyword", seeds: ["kalori sayacı"], sources });
          setPageIndex(0);
          setBuilderCollapsed(true);
        }, 0);
      } else if (preset === "fitloop") {
        setMethod("app");
        store.runQuery({ method: "app", seeds: [scopeLabels.app], sources });
        setBuilderCollapsed(true);
      } else if (preset === "competitors") {
        setMethod("competitor");
        store.runQuery({ method: "competitor", seeds: selectedCompetitors, sources });
        setBuilderCollapsed(true);
      } else {
        setMethod("category");
        store.runQuery({ method: "category", seeds: [selectedCategory], sources });
        setBuilderCollapsed(true);
      }
    },
    [store, sources, selectedCompetitors, selectedCategory, scopeLabels.app],
  );

  const commitSeedInput = () => {
    const parts = seedInputRef.current
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setSeeds((s) => Array.from(new Set([...s, ...parts])));
    seedInputRef.current = "";
    setSeedInput("");
    setSeedError(null);
  };
  const removeSeed = (kw: string) => setSeeds((s) => s.filter((x) => x !== kw));

  const clearAll = () => {
    setSeeds([]);
    seedInputRef.current = "";
    setSeedInput("");
    setSeedError(null);
    store.clear();
    setRowSelection({});
    setBuilderCollapsed(false);
  };

  /* ---- Bulk actions (single selection model) ---- */
  const selCount = selectedIds.length;

  const bulkPrimary: BulkAction[] = [
    {
      id: "track",
      label: "Takibe Ekle",
      icon: Bell,
      onClick: () => {
        store.setTracking(selectedIds, "tracked");
        toast.success(`${selectedIds.length} kelime takibe eklendi.`);
        setRowSelection({});
      },
    },
    {
      id: "meta",
      label: "Mağaza Bilgileri Adaylarına Ekle",
      icon: BadgePlus,
      onClick: () => {
        store.setMetadata(selectedIds, "candidate");
        toast.success(`${selectedIds.length} kelime mağaza bilgileri aday listesine eklendi.`);
        setRowSelection({});
      },
    },
    // Shared comparison action — identical label, limits and tooltips in every table.
    buildComparisonBulkAction({
      selectedCount: selCount,
      onOpen: () => setCompareOpen(true),
      min: COMPARISON_MIN,
      max: COMPARISON_MAX,
      itemNoun: "anahtar kelime",
    }),
  ];

  const bulkMore: BulkAction[] = [
    {
      id: "fav",
      label: "Favorilere Ekle",
      icon: Sparkles,
      onClick: () => {
        selectedIds.forEach((id) => {
          const rec = store.results.find((x) => x.id === id);
          if (rec && !rec.favoriteStatus) store.toggleFavorite(id);
        });
      },
    },
    { id: "list", label: "Listeye Kaydet", icon: Bookmark, onClick: () => setListsOpen(true) },
    {
      id: "export",
      label: "Dışa Aktar",
      icon: Download,
      onClick: () => toast.info("Dışa aktarım şu anda kullanılamıyor."),
    },
  ];

  const hasQuery = store.context != null;
  const activeQueryText = React.useMemo(() => {
    if (!store.context) return "";
    const seedTxt =
      store.context.method === "keyword" || store.context.method === "competitor"
        ? store.context.seeds.join(", ")
        : store.context.seeds[0];
    return `${seedTxt} · ${METHOD_LABEL[store.context.method]} · ${store.context.sources.length} kaynak · ${store.results.length} sonuç`;
  }, [store.context, store.results.length]);

  return (
    <WorkspacePage
      density={focusMode ? "dense" : "default"}
      className={cn(ANALYTICAL_VARIANT, "space-y-5")}
    >
      {/* HEADER */}
      {!focusMode && (
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="eyebrow mb-1">ANAHTAR KELİME KEŞFİ</div>
            <h1 className="font-editorial text-2xl font-semibold tracking-tight sm:text-3xl">
              Anahtar Kelime Araştırması
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Uygulamanız için yeni anahtar kelimeler keşfedin; talep, rekabet, alaka ve fırsat
              sinyallerini birlikte değerlendirin.
            </p>
          </div>
          <div className={cn(ANALYTICAL_CONTROLS, "flex flex-wrap items-center gap-2")}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs"
              onClick={() => setHistoryOpen(true)}
            >
              <History className="h-3.5 w-3.5" /> Araştırma Geçmişi
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs"
              onClick={() => setListsOpen(true)}
            >
              <Bookmark className="h-3.5 w-3.5" /> Kaydedilen Listeler
            </Button>
          </div>
        </header>
      )}

      {/* BUILDER (collapsible after query) */}
      {!focusMode && (!hasQuery || !builderCollapsed) && (
        <Panel className={cn(ANALYTICAL_CARD, ANALYTICAL_CONTROLS, "space-y-4")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MethodSelector value={method} onChange={setMethod} />
            <div className="text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">{scopeLabels.app}</span>
              {" · "}
              {scopeLabels.store}
              {" · "}
              {scopeLabels.country}
              {" · "}
              {scopeLabels.language}
            </div>
          </div>

          <MethodInput
            method={method}
            seeds={seeds}
            seedInput={seedInput}
            onSeedInput={(value) => {
              seedInputRef.current = value;
              setSeedInput(value);
            }}
            onCommitSeed={commitSeedInput}
            onRemoveSeed={removeSeed}
            seedError={seedError}
            selectedApp={selectedApp}
            setSelectedApp={setSelectedApp}
            selectedCompetitors={selectedCompetitors}
            setSelectedCompetitors={setSelectedCompetitors}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <SourceSelector value={sources} onChange={setSources} />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="h-9 bg-primary px-4 text-xs text-primary-foreground hover:bg-primary/90"
              onClick={submit}
            >
              <Search className="mr-1.5 h-3.5 w-3.5" /> Anahtar Kelimeleri Keşfet
            </Button>
            {hasQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1 px-3 text-xs text-muted-foreground"
                onClick={() => setBuilderCollapsed(true)}
              >
                <ChevronUp className="h-3.5 w-3.5" /> Küçült
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-xs text-muted-foreground"
              onClick={clearAll}
            >
              Temizle
            </Button>
          </div>
        </Panel>
      )}

      {/* Collapsed builder summary */}
      {!focusMode && hasQuery && builderCollapsed && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-hairline bg-surface/40 px-4 py-2 text-xs">
          <Radar className="h-3.5 w-3.5 text-primary" />
          <span className="truncate font-medium">{activeQueryText}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {scopeLabels.app} · {scopeLabels.store} · {scopeLabels.country}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 gap-1 px-2 text-[11px]"
            onClick={() => setBuilderCollapsed(false)}
          >
            <Pencil className="h-3 w-3" /> Araştırmayı Düzenle
          </Button>
        </div>
      )}

      {/* Focus context bar */}
      {focusMode && hasQuery && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-hairline bg-surface/40 px-3 py-2 text-xs">
          <Radar className="h-3.5 w-3.5 text-primary" />
          <span className="truncate font-medium">{activeQueryText}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 gap-1 px-2 text-[11px]"
            onClick={() => {
              setFocusMode(false);
              setBuilderCollapsed(false);
            }}
          >
            <Pencil className="h-3 w-3" /> Araştırmayı Düzenle
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 border-hairline px-2 text-[11px]"
            onClick={() => setFocusMode(false)}
          >
            <Minimize2 className="h-3 w-3" /> Odak Modundan Çık
          </Button>
        </div>
      )}

      {!hasQuery ? (
        <EmptyIntro onRunExample={runExample} />
      ) : (
        <>
          {/* SUMMARY STRIP (hidden in focus mode) */}
          {!focusMode && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-hairline bg-surface/40 px-4 py-3 text-xs">
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">{summary.total}</span> aday bulundu.
              </div>
              <span className="text-muted-foreground/50">·</span>
              <SummaryPill label="Yüksek Fırsat" value={summary.highOpp} />
              <SummaryPill label="Düşük Zorluk" value={summary.lowDiff} />
              <SummaryPill label="Takipte" value={summary.tracked} />
              <SummaryPill label="Mağaza Bilgilerinde" value={summary.inMeta} />
              <span className="ml-auto rounded border border-hairline bg-surface/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                Demo veri seti
              </span>
            </div>
          )}

          {/* VIEW ROW */}
          {!focusMode && (
            <div className="flex flex-wrap items-center gap-1">
              {BUILT_IN_VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setViewId(v.id);
                    setPageIndex(0);
                  }}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-[11px] transition-colors",
                    v.id === viewId
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-hairline bg-surface/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          {/* FILTER TOOLBAR — desktop only */}
          <div className="hidden md:block">
            <FilterToolbar
              filters={filters}
              setFilters={(f) => {
                setFilters(f);
                setPageIndex(0);
              }}
              advancedCount={advancedCount}
              table={table}
              density={density}
              setDensity={setDensity}
              focusMode={focusMode}
              setFocusMode={setFocusMode}
              onMoveColumn={moveByDelta}
              onMoveColumnTo={(id, target) =>
                moveColumn(id, target === "top" ? "leftmost" : "rightmost")
              }
              onPinColumn={pinColumn}
              onReorderColumns={handleDragReorder}
              onResetOrder={() => setColumnOrder(DEFAULT_FULL_COLUMN_ORDER)}
              onResetWidths={() => setColumnSizing({})}
              onAutoFitAll={() => setColumnSizing({})}
              onResetVisibility={() => setVisibility(defaultVisibility)}
            />
          </div>

          {/* MOBILE TOOLBAR */}
          <div className="md:hidden">
            <MobileToolbar
              filters={filters}
              setFilters={(f) => {
                setFilters(f);
                setPageIndex(0);
              }}
              advancedCount={advancedCount}
              resultCount={total}
              sorting={sorting}
              onSortChange={(id, desc) => setSorting([{ id, desc }])}
              onOpenFilters={() => setMobileFiltersOpen(true)}
              selectedCount={selectedIds.length}
              onSelectAllPage={() => {
                const rows = table.getRowModel().rows;
                const allSel = rows.length > 0 && rows.every((r) => r.getIsSelected());
                if (allSel) {
                  const next = { ...rowSelection };
                  rows.forEach((r) => {
                    delete next[r.id];
                  });
                  setRowSelection(next);
                } else {
                  const next = { ...rowSelection };
                  rows.forEach((r) => {
                    next[r.id] = true;
                  });
                  setRowSelection(next);
                }
              }}
              pageAllSelected={(() => {
                const rows = table.getRowModel().rows;
                return rows.length > 0 && rows.every((r) => r.getIsSelected());
              })()}
            />
          </div>

          {/* TABLE — desktop */}
          <div className={cn(ANALYTICAL_TABLE, "hidden md:block")}>
            <Panel className={ANALYTICAL_CARD_FLUSH}>
              <SonarDataGrid
                table={table}
                density={density}
                bulkSelection={{
                  count: selectedIds.length,
                  itemNoun: "anahtar kelime",
                  primary: bulkPrimary,
                  more: bulkMore,
                  onClear: () => setRowSelection({}),
                }}
                maxHeight={focusMode ? "calc(100vh - 150px)" : "calc(100vh - 290px)"}
                onColumnWidthCommit={(columnId, width) => {
                  setColumnSizing((prev) => ({ ...prev, [columnId]: width }));
                }}
                onRowClick={(r) => setSelectedForPreview(r)}
                isRowActive={(r) => selectedForPreview?.id === r.id}
                emptyTitle="Bu araştırma kriterleriyle anlamlı bir anahtar kelime adayı bulunamadı."
                emptyDescription="Kaynakları genişletmeyi veya filtreleri temizlemeyi deneyin."
                emptyActions={
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-hairline text-xs"
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                    >
                      Filtreleri Temizle
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-primary text-xs text-primary-foreground hover:bg-primary/90"
                      onClick={() =>
                        setSources(RESEARCH_SOURCES.filter((s) => s.available).map((s) => s.id))
                      }
                    >
                      Kaynakları Genişlet
                    </Button>
                  </>
                }
              />
              <DataGridPagination table={table} />
            </Panel>
          </div>

          {/* MOBILE CARD LIST */}
          <div className="md:hidden space-y-2">
            {table.getRowModel().rows.length === 0 ? (
              <div className="rounded-lg border border-hairline bg-surface/40 p-6 text-center text-xs text-muted-foreground">
                Bu araştırma kriterleriyle anlamlı bir anahtar kelime adayı bulunamadı.
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-hairline text-xs"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    Filtreleri Temizle
                  </Button>
                </div>
              </div>
            ) : (
              table
                .getRowModel()
                .rows.map((row) => (
                  <MobileKeywordCard
                    key={row.id}
                    r={row.original}
                    isSelected={row.getIsSelected()}
                    onToggleSelect={() => row.toggleSelected()}
                    onOpen={() => setSelectedForPreview(row.original)}
                    handlers={handlers}
                  />
                ))
            )}
            <MobilePagination table={table} />
            {selectedIds.length > 0 && <div className="h-16" aria-hidden />}
          </div>
        </>
      )}

      {/* MOBILE FILTER SHEET */}
      <MobileFilterSheet
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        filters={filters}
        setFilters={(f) => {
          setFilters(f);
          setPageIndex(0);
        }}
      />

      {/* PREVIEW DRAWER */}
      <QuickPreview
        record={selectedForPreview}
        open={selectedForPreview != null}
        onOpenChange={(o) => !o && setSelectedForPreview(null)}
        handlers={handlers}
      />

      {/* HISTORY SHEET */}
      <HistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        entries={store.history}
        onRemove={store.removeHistory}
        onReopen={(entry) => {
          setMethod(entry.context.method);
          setSources(entry.context.sources);
          if (entry.context.method === "keyword") setSeeds(entry.context.seeds);
          store.runQuery(entry.context);
          setHistoryOpen(false);
          setPageIndex(0);
          setBuilderCollapsed(true);
        }}
      />

      {/* SAVED LISTS SHEET */}
      <ListsSheet
        open={listsOpen}
        onOpenChange={setListsOpen}
        selectedIds={selectedIds}
        store={store}
      />

      {/* COMPARISON MODAL — shared surface, driven directly by row selection */}
      <SharedComparisonDialog<ResearchRecord>
        open={compareOpen}
        onOpenChange={setCompareOpen}
        rows={compareRows}
        idOf={(r) => r.id}
        titleOf={(r) => r.keyword}
        min={COMPARISON_MIN}
        max={COMPARISON_MAX}
        metrics={COMPARE_METRICS}
        summary={buildResearchCompareSummary(compareRows)}
        chartSeries={buildKeywordCompareSeries(compareRows, (r) => ({
          id: r.id,
          label: r.keyword,
          currentRank: r.currentRank,
          change: 0,
        }))}
        onRemove={(id) => {
          setRowSelection((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }}
      />
    </WorkspacePage>
  );
}

/* ================================================================
   METHOD SELECTOR
================================================================ */
function MethodSelector({
  value,
  onChange,
}: {
  value: ResearchMethod;
  onChange: (v: ResearchMethod) => void;
}) {
  const items: ResearchMethod[] = ["keyword", "app", "competitor", "category"];
  return (
    <div className="inline-flex rounded-lg border border-hairline bg-surface/40 p-0.5">
      {items.map((m) => {
        const Icon = METHOD_ICON[m];
        const active = m === value;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {METHOD_LABEL[m]}
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================
   METHOD-SPECIFIC INPUT
================================================================ */
function MethodInput({
  method,
  seeds,
  seedInput,
  onSeedInput,
  onCommitSeed,
  onRemoveSeed,
  seedError,
  selectedApp,
  setSelectedApp,
  selectedCompetitors,
  setSelectedCompetitors,
  selectedCategory,
  setSelectedCategory,
}: {
  method: ResearchMethod;
  seeds: string[];
  seedInput: string;
  onSeedInput: (v: string) => void;
  onCommitSeed: () => void;
  onRemoveSeed: (kw: string) => void;
  seedError: string | null;
  selectedApp: string;
  setSelectedApp: (v: string) => void;
  selectedCompetitors: string[];
  setSelectedCompetitors: (v: string[]) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
}) {
  if (method === "keyword") {
    return (
      <div>
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5 rounded-md border bg-surface/40 px-2 py-2",
            seedError ? "border-[color:var(--danger)]/40" : "border-hairline",
          )}
        >
          {seeds.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded bg-surface-2 px-2 py-0.5 text-[11px]"
            >
              {s}
              <button type="button" onClick={() => onRemoveSeed(s)} aria-label={`${s} kaldır`}>
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </span>
          ))}
          <input
            value={seedInput}
            onChange={(e) => onSeedInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                onCommitSeed();
              } else if (e.key === "Backspace" && !seedInput && seeds.length) {
                onRemoveSeed(seeds[seeds.length - 1]);
              }
            }}
            placeholder={seeds.length === 0 ? "Örn. kalori sayacı" : ""}
            className="min-w-[160px] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            aria-label="Anahtar kelime girin"
          />
        </div>
        {seedError && (
          <div className="mt-1 text-[11px] text-[color:var(--danger)]">{seedError}</div>
        )}
      </div>
    );
  }
  if (method === "app") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Uygulama
        </Label>
        <Select value={selectedApp} onValueChange={setSelectedApp}>
          <SelectTrigger className="h-9 w-[220px] border-hairline bg-surface/40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_APPS.map((a) => (
              <SelectItem key={a} value={a} className="text-xs">
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (method === "competitor") {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Rakipler:
        </Label>
        {AVAILABLE_COMPETITORS.map((c) => {
          const on = selectedCompetitors.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() =>
                setSelectedCompetitors(
                  on ? selectedCompetitors.filter((x) => x !== c) : [...selectedCompetitors, c],
                )
              }
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] transition-colors",
                on
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-hairline bg-surface/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Kategori</Label>
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="h-9 w-[220px] border-hairline bg-surface/40 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c} className="text-xs">
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ================================================================
   SOURCE SELECTOR
================================================================ */
function SourceSelector({
  value,
  onChange,
}: {
  value: ResearchSourceId[];
  onChange: (v: ResearchSourceId[]) => void;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <div>
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Keşif Kaynakları
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RESEARCH_SOURCES.map((s) => {
            const on = value.includes(s.id);
            const disabled = !s.available;
            return (
              <Tooltip key={s.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      onChange(on ? value.filter((v) => v !== s.id) : [...value, s.id]);
                    }}
                    disabled={disabled}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-colors",
                      on
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-hairline bg-surface/40 text-muted-foreground hover:text-foreground",
                      disabled && "opacity-60",
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-primary" : "bg-surface-3")}
                    />
                    {s.label}
                    {disabled && (
                      <span className="ml-1 rounded border border-hairline px-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                        Bağlantı Gerekiyor
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[240px] text-[11px]">
                  {s.description}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ================================================================
   SUMMARY / EMPTY
================================================================ */
function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </span>
  );
}

function EmptyIntro({
  onRunExample,
}: {
  onRunExample: (p: "kalori" | "fitloop" | "competitors" | "category") => void;
}) {
  return (
    <Panel
      className={cn(
        ANALYTICAL_CARD,
        ANALYTICAL_STATE,
        "flex flex-col items-center gap-4 py-14 text-center",
      )}
    >
      <div className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface/40">
        <Radar className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <div className="font-editorial text-lg font-semibold">
          Yeni anahtar kelimeler keşfetmeye başlayın
        </div>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
          Bir anahtar kelime, uygulama, rakip veya kategori seçerek Sonar’ın değerlendirebileceği
          adayları oluşturun.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <ExampleBtn onClick={() => onRunExample("kalori")}>“kalori sayacı” ile araştır</ExampleBtn>
        <ExampleBtn onClick={() => onRunExample("fitloop")}>
          FitLoop mağaza bilgilerini analiz et
        </ExampleBtn>
        <ExampleBtn onClick={() => onRunExample("competitors")}>
          Rakiplerden kelime keşfet
        </ExampleBtn>
        <ExampleBtn onClick={() => onRunExample("category")}>
          Sağlık ve Fitness kategorisini incele
        </ExampleBtn>
      </div>
    </Panel>
  );
}
function ExampleBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface/40 px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
    >
      <Sparkles className="h-3 w-3" /> {children}
    </button>
  );
}

/* ================================================================
   FILTER TOOLBAR
================================================================ */
function FilterToolbar({
  filters,
  setFilters,
  advancedCount,
  table,
  density,
  setDensity,
  focusMode,
  setFocusMode,
  onMoveColumn,
  onMoveColumnTo,
  onPinColumn,
  onReorderColumns,
  onResetOrder,
  onResetWidths,
  onAutoFitAll,
  onResetVisibility,
}: {
  filters: ResearchFilters;
  setFilters: (f: ResearchFilters) => void;
  advancedCount: number;
  table: ReturnType<typeof useReactTable<ResearchRecord>>;
  density: Density;
  setDensity: (d: Density) => void;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
  onMoveColumn: (id: string, delta: number) => void;
  onMoveColumnTo: (id: string, target: "top" | "bottom") => void;
  onPinColumn: (id: string, side: "left" | false) => void;
  onReorderColumns: (draggedId: string, targetId: string) => void;
  onResetOrder: () => void;
  onResetWidths: () => void;
  onAutoFitAll: () => void;
  onResetVisibility: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-hairline bg-surface/40 px-3 py-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          placeholder="Anahtar kelime ara…"
          className="h-9 w-[260px] border-hairline bg-background/60 pl-7 text-xs"
        />
      </div>

      <FilterSelect
        label="Kaynak"
        value={filters.source}
        options={FILTER_OPTIONS.source}
        onChange={(v) => setFilters({ ...filters, source: v as ResearchFilters["source"] })}
      />
      <FilterSelect
        label="Fırsat"
        value={filters.opportunityLevel}
        options={FILTER_OPTIONS.level}
        onChange={(v) =>
          setFilters({ ...filters, opportunityLevel: v as ResearchFilters["opportunityLevel"] })
        }
      />
      <FilterSelect
        label="Zorluk"
        value={filters.difficultyLevel}
        options={FILTER_OPTIONS.level}
        onChange={(v) =>
          setFilters({ ...filters, difficultyLevel: v as ResearchFilters["difficultyLevel"] })
        }
      />
      <FilterSelect
        label="Takip"
        value={filters.tracking}
        options={FILTER_OPTIONS.tracking}
        onChange={(v) => setFilters({ ...filters, tracking: v as ResearchFilters["tracking"] })}
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs"
          >
            <Filter className="h-3.5 w-3.5" /> Gelişmiş
            {advancedCount > 0 && (
              <span className="ml-1 rounded bg-primary/15 px-1.5 text-[10px] font-medium text-primary">
                {advancedCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[320px] border-hairline bg-background p-4">
          <AdvancedFilters filters={filters} setFilters={setFilters} />
        </PopoverContent>
      </Popover>

      {(filters.q ||
        advancedCount > 0 ||
        filters.source !== "all" ||
        filters.opportunityLevel !== "all" ||
        filters.difficultyLevel !== "all" ||
        filters.relevanceLevel !== "all" ||
        filters.tracking !== "all" ||
        filters.metadata !== "all") && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1 px-2 text-xs text-muted-foreground"
          onClick={() => setFilters(DEFAULT_FILTERS)}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Filtreleri Temizle
        </Button>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs"
                onClick={() => setFocusMode(!focusMode)}
                aria-label={focusMode ? "Odak Modundan Çık" : "Tabloyu Büyüt"}
              >
                {focusMode ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
                {focusMode ? "Odak Modundan Çık" : "Tabloyu Büyüt"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[11px]">
              Tablo görünüm alanını genişletir.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DataGridDensitySelector value={density} onChange={setDensity} />
        <DataGridColumnManager
          table={table}
          onReset={onResetVisibility}
          onResetOrder={onResetOrder}
          onResetWidths={onResetWidths}
          onAutoFitAll={onAutoFitAll}
          onMoveColumn={onMoveColumn}
          onMoveColumnTo={onMoveColumnTo}
          onPinColumn={onPinColumn}
          onReorderColumns={onReorderColumns}
        />
      </div>
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground">{label}:</span>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="h-9 w-[150px] border-hairline bg-background/60 text-xs">
          <SelectValue />
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

function AdvancedFilters({
  filters,
  setFilters,
}: {
  filters: ResearchFilters;
  setFilters: (f: ResearchFilters) => void;
}) {
  return (
    <div className="space-y-3">
      <RangeRow
        label="Tahmini Aranma Hacmi"
        min={filters.volMin}
        max={filters.volMax}
        lo={0}
        hi={100}
        onChange={(min, max) => setFilters({ ...filters, volMin: min, volMax: max })}
      />
      <RangeRow
        label="Zorluk"
        min={filters.diffMin}
        max={filters.diffMax}
        lo={0}
        hi={100}
        onChange={(min, max) => setFilters({ ...filters, diffMin: min, diffMax: max })}
      />
      <RangeRow
        label="Alaka Düzeyi"
        min={filters.relMin}
        max={filters.relMax}
        lo={0}
        hi={100}
        onChange={(min, max) => setFilters({ ...filters, relMin: min, relMax: max })}
      />
      <RangeRow
        label="Fırsat Skoru"
        min={filters.oppMin}
        max={filters.oppMax}
        lo={0}
        hi={100}
        onChange={(min, max) => setFilters({ ...filters, oppMin: min, oppMax: max })}
      />
      <RangeRow
        label="Anlamlı Sonuç Sayısı"
        min={filters.resultMin}
        max={filters.resultMax}
        lo={0}
        hi={500}
        onChange={(min, max) => setFilters({ ...filters, resultMin: min, resultMax: max })}
      />
      <RangeRow
        label="Mevcut Sıra"
        min={filters.rankMin}
        max={filters.rankMax}
        lo={1}
        hi={200}
        onChange={(min, max) => setFilters({ ...filters, rankMin: min, rankMax: max })}
      />
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[11px] text-muted-foreground">Mağaza Bilgileri</Label>
        <Select
          value={filters.metadata}
          onValueChange={(v) =>
            setFilters({ ...filters, metadata: v as ResearchFilters["metadata"] })
          }
        >
          <SelectTrigger className="h-8 w-[180px] border-hairline bg-surface/40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.metadata.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[11px] text-muted-foreground">Uzunluk</Label>
        <Select
          value={filters.longTail}
          onValueChange={(v) =>
            setFilters({ ...filters, longTail: v as ResearchFilters["longTail"] })
          }
        >
          <SelectTrigger className="h-8 w-[180px] border-hairline bg-surface/40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.longTail.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function RangeRow({
  label,
  min,
  max,
  lo,
  hi,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  lo: number;
  hi: number;
  onChange: (min: number, max: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={lo}
          max={hi}
          value={min}
          onChange={(e) => onChange(Number(e.target.value), max)}
          className="h-8 w-16 border-hairline bg-surface/40 text-xs"
        />
        <span className="text-[11px] text-muted-foreground">–</span>
        <Input
          type="number"
          min={lo}
          max={hi}
          value={max}
          onChange={(e) => onChange(min, Number(e.target.value))}
          className="h-8 w-16 border-hairline bg-surface/40 text-xs"
        />
      </div>
    </div>
  );
}

/* ================================================================
   QUICK PREVIEW DRAWER
================================================================ */
function QuickPreview({
  record,
  open,
  onOpenChange,
  handlers,
}: {
  record: ResearchRecord | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  handlers: ResearchColumnHandlers;
}) {
  const r = record;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[560px] border-hairline bg-background sm:max-w-[560px]"
      >
        {r && (
          <>
            <SheetHeader>
              <SheetTitle className="font-editorial text-lg">{r.keyword}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-5 overflow-y-auto pb-24">
              <div className="flex flex-wrap gap-1">
                {r.sources.map((s) => (
                  <span
                    key={s}
                    className="rounded border border-hairline bg-surface/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {SOURCE_MAP[s].short}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  label="Tahmini Aranma Hacmi"
                  value={r.estimatedVolume}
                  suffix="/100"
                  tip="Google Play veya App Store için kesin aylık arama sayısı değildir. Birden fazla talep sinyalinin birleştirildiği göreli 0–100 skordur."
                />
                <MetricCard
                  label="Zorluk"
                  value={r.difficulty}
                  suffix="/100"
                  tip="İlk sıralardaki uygulamaların gücü, rekabet yoğunluğu ve sonuç yapısına göre hesaplanan göreli rekabet skoru."
                />
                <MetricCard
                  label="Alaka Düzeyi"
                  value={r.relevance}
                  suffix="/100"
                  tip="Kelimenin seçili uygulamanın metadata, kategori ve mevcut görünürlüğüyle olan ilişkisi."
                />
                <MetricCard
                  label="Fırsat Skoru"
                  value={r.opportunity}
                  suffix="/100"
                  tip="Talep, zorluk, mevcut sıra, uygulama gücü ve alaka sinyallerinin birlikte değerlendirilmesiyle hesaplanan aksiyon önceliği."
                />
              </div>

              <div className="rounded-md border border-hairline bg-surface/40 p-3 text-xs">
                <div className="mb-2 font-medium">Mevcut Görünürlük</div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mevcut Sıra</span>
                  <span className="tabular-nums">
                    {r.currentRank == null ? "Top 200 İçinde Bulunamadı" : `#${r.currentRank}`}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground">Sıralamada Bulunan Rakip Sayısı</span>
                  <span className="tabular-nums">{r.rankingCompetitorCount}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground">İlk 10 Uygulama Gücü</span>
                  <span className="tabular-nums">{r.top10AppPower}/100</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground">Anlamlı Sonuç Sayısı</span>
                  <span className="tabular-nums">{r.meaningfulResultCount}</span>
                </div>
              </div>

              <Recommendation r={r} />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 border-t border-hairline bg-background/95 px-4 py-3 backdrop-blur">
              <Button
                size="sm"
                className="h-9 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                onClick={() => handlers.addTracking(r.id)}
                disabled={r.trackingStatus === "tracked"}
              >
                <Bell className="mr-1.5 h-3.5 w-3.5" />
                {r.trackingStatus === "tracked" ? "Takipte" : "Takibe Ekle"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 border-hairline px-3 text-xs"
                onClick={() => handlers.addMetadataCandidate(r.id)}
              >
                <BadgePlus className="mr-1.5 h-3.5 w-3.5" /> Mağaza Bilgilerine Ekle
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-9 px-3 text-xs"
                onClick={() => handlers.openInspector(r)}
              >
                Detaylı Analizi Aç <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  tip,
}: {
  label: string;
  value: number;
  suffix: string;
  tip: string;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rounded-md border border-hairline bg-surface/40 p-3 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{label}</span>
              <Info className="h-3 w-3 opacity-60" />
            </div>
            <div className="mt-1 font-editorial text-xl font-semibold tabular-nums">
              {value}
              <span className="ml-0.5 text-[10px] text-muted-foreground">{suffix}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px] text-[11px]">
          {tip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Recommendation({ r }: { r: ResearchRecord }) {
  const summary =
    r.opportunity >= 75 && r.difficulty < 55
      ? {
          tone: "success",
          text: "Yüksek fırsat ve yönetilebilir rekabet — takibe alıp mağaza bilgileri aday listesine eklemeyi değerlendirin.",
        }
      : r.relevance < 50
        ? {
            tone: "warning",
            text: "Alaka düşük. Uygulamanın konum ve kategorisiyle örtüşmüyor olabilir.",
          }
        : r.difficulty >= 70
          ? {
              tone: "danger",
              text: "Rekabet yüksek. Kısa vadede sıçrama için elverişli değil; uzun vadeli takip için değerlendirin.",
            }
          : {
              tone: "cobalt",
              text: "Dengeli bir aday. Takibe alıp gelişimi izlemek makul bir başlangıç.",
            };
  const tone =
    summary.tone === "success"
      ? "text-[color:var(--success)]"
      : summary.tone === "warning"
        ? "text-[color:var(--warning)]"
        : summary.tone === "danger"
          ? "text-[color:var(--danger)]"
          : "text-primary";
  return (
    <div className="rounded-md border border-hairline bg-surface/40 p-3 text-xs">
      <div className="mb-1 flex items-center gap-1.5 font-medium">
        <Sparkles className={cn("h-3.5 w-3.5", tone)} />
        Öneri
      </div>
      <p className="text-muted-foreground">{summary.text}</p>
    </div>
  );
}

/* ================================================================
   HISTORY / LISTS
================================================================ */

function HistorySheet({
  open,
  onOpenChange,
  entries,
  onRemove,
  onReopen,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  entries: ReturnType<typeof useResearchWorkspace>["history"];
  onRemove: (id: string) => void;
  onReopen: (e: ReturnType<typeof useResearchWorkspace>["history"][number]) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[440px] border-hairline bg-background sm:max-w-[440px]"
      >
        <SheetHeader>
          <SheetTitle>Araştırma Geçmişi</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2 overflow-y-auto">
          {entries.length === 0 && (
            <div className="rounded border border-hairline bg-surface/40 p-4 text-xs text-muted-foreground">
              Henüz kaydedilmiş bir araştırma yok.
            </div>
          )}
          {entries.map((e) => (
            <div key={e.id} className="rounded border border-hairline bg-surface/40 p-3 text-xs">
              <div className="font-medium">
                {e.context.seeds.join(", ") || METHOD_LABEL[e.context.method]}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {METHOD_LABEL[e.context.method]} · {e.resultCount} sonuç ·{" "}
                {new Date(e.timestamp).toLocaleString("tr-TR")}
              </div>
              <div className="mt-2 flex gap-1.5">
                <Button
                  size="sm"
                  className="h-7 bg-primary px-2 text-[11px] text-primary-foreground hover:bg-primary/90"
                  onClick={() => onReopen(e)}
                >
                  Yeniden Aç
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[11px] text-muted-foreground"
                  onClick={() => onRemove(e.id)}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ListsSheet({
  open,
  onOpenChange,
  selectedIds,
  store,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  selectedIds: string[];
  store: ReturnType<typeof useResearchWorkspace>;
}) {
  const [newName, setNewName] = React.useState("");
  const [renameId, setRenameId] = React.useState<string | null>(null);
  const [renameVal, setRenameVal] = React.useState("");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[440px] border-hairline bg-background sm:max-w-[440px]"
      >
        <SheetHeader>
          <SheetTitle>Kaydedilen Listeler</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="rounded border border-hairline bg-surface/40 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Yeni Liste
            </div>
            <div className="mt-2 flex gap-1.5">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn. Kalori Uygulaması Adayları"
                className="h-8 flex-1 border-hairline bg-background/60 text-xs"
              />
              <Button
                size="sm"
                className="h-8 bg-primary px-3 text-[11px] text-primary-foreground hover:bg-primary/90"
                disabled={!newName.trim()}
                onClick={async () => {
                  const list = await store.createList(newName.trim(), selectedIds);
                  toast.success(`"${list.name}" oluşturuldu (${list.keywordIds.length} kelime).`);
                  setNewName("");
                }}
              >
                Oluştur
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {selectedIds.length > 0
                ? `Seçili ${selectedIds.length} kelime bu listeye eklenecek.`
                : "Şu an seçili kelime yok — boş liste oluşturulacak."}
            </p>
          </div>

          <div className="space-y-2">
            {store.lists.length === 0 && (
              <div className="rounded border border-hairline bg-surface/40 p-4 text-xs text-muted-foreground">
                Henüz kaydedilmiş liste yok.
              </div>
            )}
            {store.lists.map((l) => (
              <div key={l.id} className="rounded border border-hairline bg-surface/40 p-3 text-xs">
                {renameId === l.id ? (
                  <div className="flex gap-1.5">
                    <Input
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      className="h-7 flex-1 border-hairline bg-background/60 text-xs"
                    />
                    <Button
                      size="sm"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => {
                        store.renameList(l.id, renameVal.trim() || l.name);
                        setRenameId(null);
                      }}
                    >
                      Kaydet
                    </Button>
                  </div>
                ) : (
                  <div className="font-medium">{l.name}</div>
                )}
                <div className="text-[11px] text-muted-foreground">
                  {l.keywordIds.length} kelime
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedIds.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 border-hairline px-2 text-[11px]"
                      onClick={() => {
                        store.addToList(l.id, selectedIds);
                        toast.success(
                          `${selectedIds.length} kelime "${l.name}" listesine eklendi.`,
                        );
                      }}
                    >
                      Seçilenleri Ekle
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => {
                      setRenameId(l.id);
                      setRenameVal(l.name);
                    }}
                  >
                    Yeniden Adlandır
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px] text-[color:var(--danger)]"
                    onClick={() => store.deleteList(l.id)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ================================================================
   COMPARISON DIALOG
================================================================ */

type CompareMetric = {
  id: string;
  label: string;
  value: (r: ResearchRecord) => number | null;
  render: (r: ResearchRecord) => React.ReactNode;
  higherBetter?: boolean;
  lowerBetter?: boolean;
};

const COMPARE_METRICS: CompareMetric[] = [
  {
    id: "vol",
    label: "Tahmini Aranma Hacmi",
    value: (r) => r.estimatedVolume,
    render: (r) => (
      <span>
        {r.estimatedVolume}
        <span className="text-[10px] text-muted-foreground">/100</span>
      </span>
    ),
    higherBetter: true,
  },
  {
    id: "diff",
    label: "Zorluk",
    value: (r) => r.difficulty,
    render: (r) => (
      <span>
        {r.difficulty}
        <span className="text-[10px] text-muted-foreground">/100</span>
      </span>
    ),
    lowerBetter: true,
  },
  {
    id: "rel",
    label: "Alaka Düzeyi",
    value: (r) => r.relevance,
    render: (r) => (
      <span>
        {r.relevance}
        <span className="text-[10px] text-muted-foreground">/100</span>
      </span>
    ),
    higherBetter: true,
  },
  {
    id: "opp",
    label: "Fırsat Skoru",
    value: (r) => r.opportunity,
    render: (r) => (
      <span>
        {r.opportunity}
        <span className="text-[10px] text-muted-foreground">/100</span>
      </span>
    ),
    higherBetter: true,
  },
  {
    id: "rank",
    label: "Mevcut Sıra",
    value: (r) => (r.currentRank == null ? null : r.currentRank),
    render: (r) =>
      r.currentRank == null ? (
        <span className="text-[11px] text-muted-foreground">Top 200 İçinde Bulunamadı</span>
      ) : (
        <span>#{r.currentRank}</span>
      ),
    lowerBetter: true,
  },
  {
    id: "comp",
    label: "Sıralamada Bulunan Rakip Sayısı",
    value: (r) => r.rankingCompetitorCount,
    render: (r) => <span>{r.rankingCompetitorCount}</span>,
  },
  {
    id: "power",
    label: "İlk 10 Uygulama Gücü",
    value: (r) => r.top10AppPower,
    render: (r) => (
      <span>
        {r.top10AppPower}
        <span className="text-[10px] text-muted-foreground">/100</span>
      </span>
    ),
    lowerBetter: true,
  },
  {
    id: "meaning",
    label: "Anlamlı Sonuç Sayısı",
    value: (r) => r.meaningfulResultCount,
    render: (r) => <span>{r.meaningfulResultCount}</span>,
    higherBetter: true,
  },
  {
    id: "srcCount",
    label: "Kaynak Sayısı",
    value: (r) => r.sources.length,
    render: (r) => <span>{r.sources.length}</span>,
  },
  {
    id: "sources",
    label: "Kaynaklar",
    value: () => null,
    render: (r) => (
      <span className="text-[11px] text-muted-foreground">
        {r.sources.map((s) => SOURCE_MAP[s].short).join(", ")}
      </span>
    ),
  },
  {
    id: "tracking",
    label: "Takip Durumu",
    value: () => null,
    render: (r) => (
      <span className="text-[11px]">
        {r.trackingStatus === "tracked"
          ? "Takipte"
          : r.trackingStatus === "candidate"
            ? "Aday"
            : "Takip Dışı"}
      </span>
    ),
  },
  {
    id: "meta",
    label: "Mağaza Bilgilerinde Kullanım",
    value: () => null,
    render: (r) => (
      <span className="text-[11px]">
        {r.metadataStatus === "in_use"
          ? "Kullanılıyor"
          : r.metadataStatus === "candidate"
            ? "Aday"
            : "Kullanılmıyor"}
      </span>
    ),
  },
];

/** Local alias kept for the summary derivation below. */
function bestIndex(records: ResearchRecord[], metric: CompareMetric): number | null {
  const values = records.map((r) => metric.value(r));
  if (metric.higherBetter) {
    let best = -Infinity,
      idx: number | null = null;
    values.forEach((v, i) => {
      if (v != null && v > best) {
        best = v;
        idx = i;
      }
    });
    return idx;
  }
  if (metric.lowerBetter) {
    let best = Infinity,
      idx: number | null = null;
    values.forEach((v, i) => {
      if (v != null && v < best) {
        best = v;
        idx = i;
      }
    });
    return idx;
  }
  return null;
}

/** Derived highlight tiles for the shared comparison dialog. */
function buildResearchCompareSummary(records: ResearchRecord[]): SharedComparisonSummaryItem[] {
  if (records.length < COMPARISON_MIN) return [];
  const pick = (id: string, label: string, tone: "cobalt" | "success" | "warning") => {
    const metric = COMPARE_METRICS.find((m) => m.id === id);
    if (!metric) return null;
    const idx = bestIndex(records, metric);
    if (idx == null) return null;
    const r = records[idx];
    const v = metric.value(r);
    return { label, title: r.keyword, value: v == null ? "—" : `${v}/100`, tone };
  };
  return [
    pick("opp", "En Yüksek Fırsat", "cobalt"),
    pick("diff", "En Düşük Zorluk", "success"),
    pick("rel", "En Yüksek Alaka", "warning"),
  ].filter(Boolean) as SharedComparisonSummaryItem[];
}

/* ================================================================
   MOBILE — TOOLBAR / CARD / PAGINATION / FILTER SHEET
================================================================ */
function MobileToolbar({
  filters,
  setFilters,
  advancedCount,
  resultCount,
  sorting,
  onSortChange,
  onOpenFilters,
  selectedCount,
  onSelectAllPage,
  pageAllSelected,
}: {
  filters: ResearchFilters;
  setFilters: (f: ResearchFilters) => void;
  advancedCount: number;
  resultCount: number;
  sorting: SortingState;
  onSortChange: (id: string, desc: boolean) => void;
  onOpenFilters: () => void;
  selectedCount: number;
  onSelectAllPage: () => void;
  pageAllSelected: boolean;
}) {
  const sortValue = sorting[0]
    ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`
    : "opportunity:desc";
  const anyActive =
    filters.q ||
    advancedCount > 0 ||
    filters.source !== "all" ||
    filters.opportunityLevel !== "all" ||
    filters.difficultyLevel !== "all" ||
    filters.relevanceLevel !== "all" ||
    filters.tracking !== "all" ||
    filters.metadata !== "all";
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-hairline bg-surface/40 px-3 py-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium tabular-nums">{resultCount}</span>
        <span className="text-muted-foreground">sonuç</span>
      </div>
      <button
        type="button"
        onClick={onSelectAllPage}
        className="text-[11px] text-primary underline-offset-2 hover:underline"
      >
        {pageAllSelected ? "Seçimi Kaldır" : "Tümünü Seç"}
      </button>
      {selectedCount > 0 && (
        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary tabular-nums">
          {selectedCount} seçili
        </span>
      )}
      <div className="ml-auto flex items-center gap-1.5">
        <Select
          value={sortValue}
          onValueChange={(v) => {
            const [id, dir] = v.split(":");
            onSortChange(id, dir === "desc");
          }}
        >
          <SelectTrigger className="h-9 w-[135px] border-hairline bg-background/60 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opportunity:desc" className="text-xs">
              Fırsat (Yüksek)
            </SelectItem>
            <SelectItem value="difficulty:asc" className="text-xs">
              Zorluk (Düşük)
            </SelectItem>
            <SelectItem value="estimatedVolume:desc" className="text-xs">
              Hacim (Yüksek)
            </SelectItem>
            <SelectItem value="relevance:desc" className="text-xs">
              Alaka (Yüksek)
            </SelectItem>
            <SelectItem value="currentRank:asc" className="text-xs">
              Mevcut Sıra
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFilters}
          className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs"
        >
          <Filter className="h-3.5 w-3.5" /> Filtreler
          {advancedCount > 0 && (
            <span className="ml-1 rounded bg-primary/15 px-1.5 text-[10px] font-medium text-primary">
              {advancedCount}
            </span>
          )}
          {anyActive && advancedCount === 0 && (
            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </Button>
      </div>
    </div>
  );
}

function MobileKeywordCard({
  r,
  isSelected,
  onToggleSelect,
  onOpen,
  handlers,
}: {
  r: ResearchRecord;
  isSelected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  handlers: ResearchColumnHandlers;
}) {
  const isTracked = r.trackingStatus === "tracked";
  const oppTone =
    r.opportunity >= 70
      ? "text-[color:var(--success)]"
      : r.opportunity >= 40
        ? "text-[color:var(--warning)]"
        : "text-foreground";
  const diffTone =
    r.difficulty < 40
      ? "text-[color:var(--success)]"
      : r.difficulty < 70
        ? "text-[color:var(--warning)]"
        : "text-[color:var(--danger)]";
  const stop = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      data-selected={isSelected || undefined}
      className={cn(
        "rounded-lg border border-hairline bg-surface/60 p-3 transition-colors",
        "data-[selected]:border-primary/40 data-[selected]:bg-[color:var(--cobalt-soft)]/60",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onToggleSelect();
          }}
          aria-label={isSelected ? "Seçimi kaldır" : "Seç"}
          className={cn(
            "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded border",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-hairline bg-background",
          )}
        >
          {isSelected && <Check className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            handlers.toggleFavorite(r.id);
          }}
          aria-label={r.favoriteStatus ? "Favorilerden çıkar" : "Favorilere ekle"}
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center"
        >
          <Star
            className={cn(
              "h-4 w-4",
              r.favoriteStatus
                ? "fill-[color:var(--warning)] text-[color:var(--warning)]"
                : "text-muted-foreground",
            )}
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 break-words text-sm font-semibold leading-snug">
            {r.keyword}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {r.sources.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded border border-hairline bg-surface/40 px-1 py-0 text-[9px] text-muted-foreground"
              >
                {SOURCE_MAP[s].short}
              </span>
            ))}
            {r.sources.length > 3 && (
              <span className="text-[9px] text-muted-foreground">+{r.sources.length - 3}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            if (isTracked) handlers.removeTracking(r.id);
            else handlers.addTracking(r.id);
          }}
          className={cn(
            "shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium",
            isTracked
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-hairline bg-background text-muted-foreground",
          )}
        >
          {isTracked ? "Takipte" : "Takibe Ekle"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <MetricMini label="Fırsat" value={r.opportunity} tone={oppTone} />
        <MetricMini label="Aranma Hacmi" value={r.estimatedVolume} />
        <MetricMini label="Zorluk" value={r.difficulty} tone={diffTone} />
        <MetricMini label="Alaka" value={r.relevance} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-hairline/60 pt-2 text-[11px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Mevcut Sıra</span>
          <span className="tabular-nums">{r.currentRank == null ? "—" : `#${r.currentRank}`}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Sonuç</span>
          <span className="tabular-nums">{r.meaningfulResultCount}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Rakip</span>
          <span className="tabular-nums">{r.rankingCompetitorCount}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Kaynak</span>
          <span className="tabular-nums">{r.sources.length}</span>
        </div>
      </div>
    </div>
  );
}

function MetricMini({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-md border border-hairline/60 bg-background/50 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 text-sm font-semibold tabular-nums", tone)}>
        {value}
        <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function MobilePagination({ table }: { table: ReturnType<typeof useReactTable<ResearchRecord>> }) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = Math.max(1, table.getPageCount());
  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="h-10 gap-1 border-hairline px-3 text-xs"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Önceki
      </Button>
      <span className="text-xs text-muted-foreground">
        Sayfa <span className="font-medium tabular-nums text-foreground">{pageIndex + 1}</span> /{" "}
        {pageCount}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="h-10 gap-1 border-hairline px-3 text-xs"
      >
        Sonraki <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function MobileFilterSheet({
  open,
  onOpenChange,
  filters,
  setFilters,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  filters: ResearchFilters;
  setFilters: (f: ResearchFilters) => void;
}) {
  const [draft, setDraft] = React.useState<ResearchFilters>(filters);
  React.useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] overflow-y-auto border-hairline bg-background p-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] sm:max-w-full"
      >
        <SheetHeader>
          <SheetTitle className="text-base">Filtreler</SheetTitle>
        </SheetHeader>
        <div className="mt-3 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={draft.q}
              onChange={(e) => setDraft({ ...draft, q: e.target.value })}
              placeholder="Anahtar kelime ara…"
              className="h-11 border-hairline bg-background/60 pl-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MobileSelectRow
              label="Kaynak"
              value={draft.source}
              options={FILTER_OPTIONS.source}
              onChange={(v) => setDraft({ ...draft, source: v as ResearchFilters["source"] })}
            />
            <MobileSelectRow
              label="Takip"
              value={draft.tracking}
              options={FILTER_OPTIONS.tracking}
              onChange={(v) => setDraft({ ...draft, tracking: v as ResearchFilters["tracking"] })}
            />
            <MobileSelectRow
              label="Fırsat"
              value={draft.opportunityLevel}
              options={FILTER_OPTIONS.level}
              onChange={(v) =>
                setDraft({ ...draft, opportunityLevel: v as ResearchFilters["opportunityLevel"] })
              }
            />
            <MobileSelectRow
              label="Zorluk"
              value={draft.difficultyLevel}
              options={FILTER_OPTIONS.level}
              onChange={(v) =>
                setDraft({ ...draft, difficultyLevel: v as ResearchFilters["difficultyLevel"] })
              }
            />
          </div>
          <div className="rounded-md border border-hairline bg-surface/40 p-3">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Gelişmiş
            </div>
            <AdvancedFilters filters={draft} setFilters={setDraft} />
          </div>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-10 flex gap-2 border-t border-hairline bg-background/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur">
          <Button
            variant="outline"
            size="sm"
            className="h-11 flex-1 border-hairline text-sm"
            onClick={() => setDraft(DEFAULT_FILTERS)}
          >
            Temizle
          </Button>
          <Button
            size="sm"
            className="h-11 flex-1 bg-primary text-sm text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              setFilters(draft);
              onOpenChange(false);
            }}
          >
            Uygula
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileSelectRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="mt-1 h-10 w-full border-hairline bg-surface/40 text-xs">
          <SelectValue />
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
