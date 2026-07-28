import * as React from "react";
import {
  Star,
  MoreHorizontal,
  Eye,
  ArrowUpRight,
  Bell,
  BellOff,
  BadgePlus,
  GitCompare,
  Download,
  ChevronRight,
  Pin,
  PinOff,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowLeft,
  ArrowRight,
  EyeOff,
  Maximize2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Info,
} from "lucide-react";
import type { ColumnDef, Column, HeaderContext } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  DataFreshnessIndicator,
  freshnessFromMinutes,
  type SonarColumnMeta,
} from "@/components/sonar-data-grid";
import { ScoreCell, RankCell } from "@/components/shared/cells";
import { SharedMetricHeader } from "@/components/shared/metric-header";
import { getMetricTooltip, metricLabel } from "@/components/shared/metric-definitions";
import {
  FLEX_DATA_COLUMN,
  UTILITY_COLUMN,
  UNBOUNDED_COLUMN_MAX,
} from "@/components/shared/table-presets";
import type { ResearchRecord } from "./types";
import { SOURCE_MAP } from "./data";

function difficultyLabel(v: number) {
  return v >= 70 ? "Yüksek" : v >= 45 ? "Orta" : "Düşük";
}
const DIFF_TONE: Record<string, string> = {
  Düşük: "text-[color:var(--success)]",
  Orta: "text-[color:var(--warning)]",
  Yüksek: "text-[color:var(--danger)]",
};
function oppTone(v: number) {
  if (v >= 75)
    return "bg-[color:var(--success)]/12 text-[color:var(--success)] ring-[color:var(--success)]/25";
  if (v >= 55)
    return "bg-[color:var(--cobalt)]/12 text-[color:var(--cobalt)] ring-[color:var(--cobalt)]/25";
  return "bg-surface-3 text-muted-foreground ring-hairline";
}
const meta = (m: SonarColumnMeta): SonarColumnMeta => m;

export interface ResearchColumnHandlers {
  toggleFavorite: (id: string) => void;
  addTracking: (id: string) => void;
  removeTracking: (id: string) => void;
  addMetadataCandidate: (id: string) => void;
  openPreview: (r: ResearchRecord) => void;
  openInspector: (r: ResearchRecord) => void;
  /** Column ops used by the header menu */
  moveColumn: (id: string, target: "leftmost" | "left" | "right" | "rightmost") => void;
  pinColumn: (id: string, side: "left" | false) => void;
  autoFitColumn: (id: string) => void;
}

/* ---------------- Metric information tooltips ----------------
   Definitions live in the central metric dictionary
   (`@/components/shared/metric-definitions`) so the same metric reads
   identically in every table. This export stays for backward
   compatibility with existing call sites.
------------------------------------------------------------------- */

export const METRIC_INFO: Record<string, string> = Object.fromEntries(
  [
    "estimatedVolume",
    "difficulty",
    "relevance",
    "opportunity",
    "meaningfulResultCount",
    "currentRank",
    "rankingCompetitorCount",
    "top10AppPower",
    "sources",
    "sourceCount",
    "trackingStatus",
    "metadataStatus",
    "updatedMinutesAgo",
    "serpStability",
  ]
    .map((id) => [id, getMetricTooltip(id)])
    .filter((e): e is [string, string] => typeof e[1] === "string"),
);

/* ---------------- Header component with sort + menu ----------------
   Label, sort indicator and metric info tooltip come from the shared
   `SharedMetricHeader`; this wrapper only supplies the column menu.
------------------------------------------------------------------- */

function ResearchHeader({
  column,
  label,
  align = "left",
  h,
  fullLabel,
}: {
  column: Column<ResearchRecord, unknown>;
  ctx: HeaderContext<ResearchRecord, unknown>;
  label: string;
  /** Full canonical metric name — used in tooltip title & aria-label. */
  fullLabel?: string;
  align?: "left" | "right" | "center";
  h: ResearchColumnHandlers;
}) {
  const cMeta = (column.columnDef.meta ?? {}) as SonarColumnMeta;
  const pinned = column.getIsPinned();
  const canMenu = cMeta.reorderable === true;
  const titleForTooltip = fullLabel ?? label;

  const menu = canMenu ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${titleForTooltip} sütun menüsü`}
          className="grid h-6 w-6 place-items-center rounded text-muted-foreground/70 opacity-0 transition-opacity duration-100 hover:bg-surface-3 hover:text-foreground focus-visible:opacity-100 group-hover/th:opacity-100 data-[state=open]:opacity-100"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px] border-hairline bg-popover">
        <DropdownMenuItem className="text-xs" onClick={() => h.moveColumn(column.id, "leftmost")}>
          <ArrowLeftToLine className="mr-2 h-3.5 w-3.5" /> En Sola Taşı
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => h.moveColumn(column.id, "left")}>
          <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Sola Taşı
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => h.moveColumn(column.id, "right")}>
          <ArrowRight className="mr-2 h-3.5 w-3.5" /> Sağa Taşı
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => h.moveColumn(column.id, "rightmost")}>
          <ArrowRightToLine className="mr-2 h-3.5 w-3.5" /> En Sağa Taşı
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {pinned === "left" ? (
          <DropdownMenuItem className="text-xs" onClick={() => h.pinColumn(column.id, false)}>
            <PinOff className="mr-2 h-3.5 w-3.5" /> Sabitlemeyi Kaldır
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="text-xs" onClick={() => h.pinColumn(column.id, "left")}>
            <Pin className="mr-2 h-3.5 w-3.5" /> Sola Sabitle
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-xs" onClick={() => h.autoFitColumn(column.id)}>
          <Maximize2 className="mr-2 h-3.5 w-3.5" /> Bu Sütunu Otomatik Sığdır
        </DropdownMenuItem>
        {cMeta.canHide !== false && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="mr-2 h-3.5 w-3.5" /> Bu Sütunu Gizle
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <SharedMetricHeader
      column={column}
      label={label}
      metricKey={column.id}
      info={METRIC_INFO[column.id]}
      align={align}
      trailing={menu}
    />
  );
}

/* ---------------- Cell helpers ---------------- */

function FavCell({ r, onToggle }: { r: ResearchRecord; onToggle: (id: string) => void }) {
  return (
    <button
      type="button"
      data-row-noclick="true"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(r.id);
      }}
      aria-label={r.favoriteStatus ? "Favorilerden Çıkar" : "Favorilere Ekle"}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md text-muted-foreground",
        "hover:bg-surface-2 hover:text-foreground",
        r.favoriteStatus && "text-[color:var(--warning)]",
      )}
    >
      <Star className={cn("h-3.5 w-3.5", r.favoriteStatus && "fill-[color:var(--warning)]")} />
    </button>
  );
}

function SourceCell({ r }: { r: ResearchRecord }) {
  const [first, ...rest] = r.sources;
  if (!first) return <span className="text-[11px] text-muted-foreground">—</span>;
  const firstInfo = SOURCE_MAP[first];
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span data-row-noclick="true" className="inline-flex items-center gap-1">
            <span className="inline-flex items-center rounded border border-hairline bg-surface/60 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {firstInfo.short}
            </span>
            {rest.length > 0 && (
              <span className="inline-flex items-center rounded border border-hairline bg-surface/40 px-1 text-[11px] text-muted-foreground">
                +{rest.length}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-[11px]">
          <div className="mb-1 font-medium">Kaynaklar</div>
          <ul className="space-y-0.5">
            {r.sources.map((s) => (
              <li key={s}>· {SOURCE_MAP[s].label}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TrackingCell({ r, h }: { r: ResearchRecord; h: ResearchColumnHandlers }) {
  const isTracked = r.trackingStatus === "tracked";
  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-row-noclick="true"
            onClick={(e) => {
              e.stopPropagation();
              if (isTracked) h.removeTracking(r.id);
              else h.addTracking(r.id);
            }}
            aria-pressed={isTracked}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-medium transition-colors",
              isTracked
                ? "bg-[color:var(--cobalt)]/12 text-[color:var(--cobalt)] ring-1 ring-[color:var(--cobalt)]/25 hover:bg-[color:var(--cobalt)]/20"
                : "border border-hairline bg-surface/40 text-muted-foreground hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {isTracked ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
            {isTracked ? "Takipte" : "Takibe Ekle"}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[11px]">
          {isTracked ? "Takipten çıkarmak için tıklayın" : "Takibe eklemek için tıklayın"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function VolumeCell({ r, size }: { r: ResearchRecord; size: number }) {
  const narrow = size < 120;
  return (
    <span className="inline-flex items-baseline gap-1 tabular-nums">
      <ScoreCell value={r.estimatedVolume} showLabel={!narrow} />
    </span>
  );
}

function RowActions({ r, h }: { r: ResearchRecord; h: ResearchColumnHandlers }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-row-noclick="true"
          aria-label="Satır işlemleri"
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px] border-hairline bg-background">
        <DropdownMenuItem className="text-xs" onClick={() => h.openPreview(r)}>
          <Eye className="mr-2 h-3.5 w-3.5" /> Hızlı İncele
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => h.openInspector(r)}>
          <ArrowUpRight className="mr-2 h-3.5 w-3.5" /> Detaylı Analizi Aç
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {r.trackingStatus === "tracked" ? (
          <DropdownMenuItem className="text-xs" onClick={() => h.removeTracking(r.id)}>
            <BellOff className="mr-2 h-3.5 w-3.5" /> Takipten Çıkar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="text-xs" onClick={() => h.addTracking(r.id)}>
            <Bell className="mr-2 h-3.5 w-3.5" /> Takibe Ekle
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-xs" onClick={() => h.addMetadataCandidate(r.id)}>
          <BadgePlus className="mr-2 h-3.5 w-3.5" /> Mağaza Bilgilerine Ekle
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => h.toggleFavorite(r.id)}>
          <Star className="mr-2 h-3.5 w-3.5" />
          {r.favoriteStatus ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ---------------- Column IDs & defaults ---------------- */

/** Order of data columns (excludes utility columns). Reorderable. */
export const DEFAULT_DATA_COLUMN_ORDER: string[] = [
  "kw",
  "estimatedVolume",
  "difficulty",
  "relevance",
  "opportunity",
  "meaningfulResultCount",
  "currentRank",
  "rankingCompetitorCount",
  "sources",
  "trackingStatus",
  "top10AppPower",
  "metadataStatus",
  "updatedMinutesAgo",
  "sourceCount",
  "seed",
  "wordCount",
];

/** Full default column order (utility columns pinned). */
export const DEFAULT_FULL_COLUMN_ORDER: string[] = [
  "select",
  "favorite",
  ...DEFAULT_DATA_COLUMN_ORDER,
  "_actionsSpacer",
  "actions",
];

export const DEFAULT_COLUMN_PINNING = {
  left: ["select", "favorite", "kw"],
  right: ["actions"],
};

/** Columns that must NEVER move out of the utility zones. */
export const UTILITY_COLUMN_IDS = new Set(["select", "favorite", "_actionsSpacer", "actions"]);

export function makeResearchColumns(h: ResearchColumnHandlers): ColumnDef<ResearchRecord>[] {
  return [
    {
      id: "select",
      size: 44,
      minSize: 44,
      maxSize: 44,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      meta: meta({
        label: "Seçim",
        canHide: false,
        width: 44,
        align: "center",
        interactive: true,
        ...UTILITY_COLUMN,
      }),
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(Boolean(v))}
          aria-label="Tüm satırları seç"
          className="h-3.5 w-3.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(Boolean(v))}
          aria-label={`${row.original.keyword} seç`}
          className="h-3.5 w-3.5"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: "favorite",
      size: 44,
      minSize: 44,
      maxSize: 44,
      enableResizing: false,
      accessorFn: (r) => (r.favoriteStatus ? 1 : 0),
      enableSorting: true,
      enableHiding: false,
      meta: meta({
        label: "Favori",
        canHide: false,
        width: 44,
        align: "center",
        interactive: true,
        ...UTILITY_COLUMN,
      }),
      header: () => <Star className="mx-auto h-3.5 w-3.5 text-muted-foreground" />,
      cell: ({ row }) => <FavCell r={row.original} onToggle={h.toggleFavorite} />,
    },
    {
      id: "kw",
      size: 220,
      minSize: 180,
      maxSize: UNBOUNDED_COLUMN_MAX,
      accessorKey: "keyword",
      enableSorting: true,
      enableHiding: false,
      meta: meta({
        label: "Anahtar Kelime",
        canHide: false,
        width: 220,
        reorderable: true,
        pinnable: true,
        ...FLEX_DATA_COLUMN(2),
      }),
      header: (ctx) => (
        <ResearchHeader column={ctx.column} ctx={ctx} label="Anahtar Kelime" h={h} />
      ),
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold">{r.keyword}</div>
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {r.wordCount} kelime · {r.charLength} karakter
            </div>
          </div>
        );
      },
    },
    {
      id: "estimatedVolume",
      accessorKey: "estimatedVolume",
      size: 130,
      minSize: 115,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: metricLabel("estimatedVolume"),
        align: "right",
        width: 130,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader
          column={ctx.column}
          ctx={ctx}
          align="right"
          h={h}
          label="Aranma Hacmi"
          fullLabel="Tahmini Aranma Hacmi"
        />
      ),
      cell: ({ row, column }) => <VolumeCell r={row.original} size={column.getSize()} />,
    },
    {
      id: "difficulty",
      accessorKey: "difficulty",
      size: 110,
      minSize: 85,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Zorluk",
        align: "right",
        width: 110,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader column={ctx.column} ctx={ctx} align="right" label="Zorluk" h={h} />
      ),
      cell: ({ row, column }) => {
        const l = difficultyLabel(row.original.difficulty);
        const narrow = column.getSize() < 110;
        return (
          <span className="tabular-nums">
            <span className="font-semibold text-[14px]">{row.original.difficulty}</span>
            {!narrow && <span className={cn("ml-1.5 text-[11.5px]", DIFF_TONE[l])}>· {l}</span>}
          </span>
        );
      },
    },
    {
      id: "relevance",
      accessorKey: "relevance",
      size: 118,
      minSize: 80,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: metricLabel("relevance"),
        align: "right",
        width: 118,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader column={ctx.column} ctx={ctx} align="right" label="Alaka" h={h} />
      ),
      cell: ({ row, column }) => (
        <ScoreCell value={row.original.relevance} showLabel={column.getSize() >= 100} />
      ),
    },
    {
      id: "opportunity",
      accessorKey: "opportunity",
      size: 128,
      minSize: 95,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Fırsat Skoru",
        align: "right",
        width: 128,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader column={ctx.column} ctx={ctx} align="right" label="Fırsat" h={h} />
      ),
      cell: ({ row }) => <ScoreCell value={row.original.opportunity} />,
    },
    {
      id: "meaningfulResultCount",
      accessorKey: "meaningfulResultCount",
      size: 115,
      minSize: 100,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Anlamlı Sonuç Sayısı",
        align: "right",
        width: 115,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader
          column={ctx.column}
          ctx={ctx}
          align="right"
          h={h}
          label="Sonuç Sayısı"
          fullLabel="Anlamlı Sonuç Sayısı"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-[14px]">{row.original.meaningfulResultCount}</span>
      ),
    },
    {
      id: "currentRank",
      accessorFn: (r) => r.currentRank ?? Number.MAX_SAFE_INTEGER,
      size: 135,
      minSize: 115,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Mevcut Sıra",
        align: "right",
        width: 135,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader column={ctx.column} ctx={ctx} align="right" label="Mevcut Sıra" h={h} />
      ),
      cell: ({ row }) => <RankCell rank={row.original.currentRank} />,
    },
    {
      id: "rankingCompetitorCount",
      accessorKey: "rankingCompetitorCount",
      size: 110,
      minSize: 95,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Sıralamada Bulunan Rakip Sayısı",
        align: "right",
        width: 110,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader
          column={ctx.column}
          ctx={ctx}
          align="right"
          h={h}
          label="Rakip Sayısı"
          fullLabel="Sıralamada Bulunan Rakip Sayısı"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-[14px]">{row.original.rankingCompetitorCount}</span>
      ),
    },
    {
      id: "sources",
      size: 130,
      minSize: 110,
      maxSize: UNBOUNDED_COLUMN_MAX,
      enableSorting: false,
      meta: meta({
        label: "Kaynak",
        width: 130,
        interactive: true,
        reorderable: true,
        pinnable: true,
        ...FLEX_DATA_COLUMN(1),
      }),
      header: (ctx) => <ResearchHeader column={ctx.column} ctx={ctx} label="Kaynak" h={h} />,
      cell: ({ row }) => <SourceCell r={row.original} />,
    },
    {
      id: "trackingStatus",
      accessorKey: "trackingStatus",
      size: 140,
      minSize: 125,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Takip",
        width: 140,
        interactive: true,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader
          column={ctx.column}
          ctx={ctx}
          label="Takip"
          h={h}
          fullLabel="Takip Durumu"
        />
      ),
      cell: ({ row }) => <TrackingCell r={row.original} h={h} />,
    },
    {
      id: "top10AppPower",
      accessorKey: "top10AppPower",
      size: 135,
      minSize: 115,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "İlk 10 Uygulama Gücü",
        align: "right",
        width: 135,
        defaultVisible: false,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader
          column={ctx.column}
          ctx={ctx}
          align="right"
          h={h}
          label="İlk 10 Uygulama Gücü"
        />
      ),
      cell: ({ row }) => <ScoreCell value={row.original.top10AppPower} showLabel={false} />,
    },
    {
      id: "metadataStatus",
      accessorKey: "metadataStatus",
      size: 160,
      minSize: 105,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Mağaza Bilgilerinde Kullanım",
        width: 160,
        defaultVisible: false,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader column={ctx.column} ctx={ctx} label="Mağaza Bilgilerinde Kullanım" h={h} />
      ),
      cell: ({ row }) => {
        const v = row.original.metadataStatus;
        const label =
          v === "in_use" ? "Kullanılıyor" : v === "candidate" ? "Aday Listesinde" : "Kullanılmıyor";
        const tone =
          v === "in_use"
            ? "text-[color:var(--success)]"
            : v === "candidate"
              ? "text-[color:var(--cobalt)]"
              : "text-muted-foreground";
        return <span className={cn("text-[11.5px] font-medium", tone)}>{label}</span>;
      },
    },
    {
      id: "updatedMinutesAgo",
      accessorKey: "updatedMinutesAgo",
      size: 140,
      minSize: 105,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Son Güncelleme",
        width: 140,
        defaultVisible: false,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader column={ctx.column} ctx={ctx} label="Son Güncelleme" h={h} />
      ),
      cell: ({ row }) => (
        <DataFreshnessIndicator freshness={freshnessFromMinutes(row.original.updatedMinutesAgo)} />
      ),
    },
    {
      id: "sourceCount",
      accessorFn: (r) => r.sources.length,
      size: 110,
      minSize: 95,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Kaynak Sayısı",
        align: "right",
        width: 110,
        defaultVisible: false,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader column={ctx.column} ctx={ctx} align="right" label="Kaynak Sayısı" h={h} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-[14px]">{row.original.sources.length}</span>
      ),
    },
    {
      id: "seed",
      accessorKey: "seed",
      size: 140,
      minSize: 110,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Kaynak Anahtar Kelime",
        width: 140,
        defaultVisible: false,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => <ResearchHeader column={ctx.column} ctx={ctx} label="Kaynak Kelime" h={h} />,
      cell: ({ row }) => (
        <span className="truncate text-[11.5px] text-muted-foreground">
          {row.original.seed || "—"}
        </span>
      ),
    },
    {
      id: "wordCount",
      accessorKey: "wordCount",
      size: 140,
      minSize: 110,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Uzunluk",
        align: "right",
        width: 140,
        defaultVisible: false,
        reorderable: true,
        pinnable: true,
      }),
      header: (ctx) => (
        <ResearchHeader
          column={ctx.column}
          ctx={ctx}
          align="right"
          h={h}
          label="Uzunluk"
          fullLabel="Uzunluk / Kelime Sayısı"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-[11.5px] text-muted-foreground">
          {row.original.wordCount} kelime · {row.original.charLength} karakter
        </span>
      ),
    },
    {
      id: "_actionsSpacer",
      size: 56,
      minSize: 56,
      maxSize: 56,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      meta: meta({ label: "", canHide: false, width: 56, ...UTILITY_COLUMN }),
      header: () => null,
      cell: () => null,
    },
    {
      id: "actions",
      size: 52,
      minSize: 52,
      maxSize: 52,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      meta: meta({
        label: "İşlemler",
        canHide: false,
        width: 52,
        align: "center",
        interactive: true,
        ...UTILITY_COLUMN,
      }),
      header: () => null,
      cell: ({ row }) => (
        <div className="grid place-items-center">
          <RowActions r={row.original} h={h} />
        </div>
      ),
    },
  ];
}

export function getDefaultColumnVisibility(cols: ColumnDef<ResearchRecord>[]) {
  const out: Record<string, boolean> = {};
  for (const c of cols) {
    const m = (c.meta ?? {}) as SonarColumnMeta;
    out[(c.id ?? "") as string] = m.defaultVisible !== false;
  }
  return out;
}

/** Default width map — used by "reset widths" and to reset a single column. */
export function getDefaultColumnSizing(cols: ColumnDef<ResearchRecord>[]) {
  const out: Record<string, number> = {};
  for (const c of cols) {
    const id = (c as { id?: string }).id;
    const size = (c as { size?: number }).size;
    if (id && typeof size === "number") out[id] = size;
  }
  return out;
}
