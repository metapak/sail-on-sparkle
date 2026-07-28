import * as React from "react";
import {
  Star,
  MoreHorizontal,
  Eye,
  ChartLine,
  Bell,
  BellOff,
  Tag,
  FolderPlus,
  History,
  Users,
  RefreshCw,
  Download,
  ArrowUpRight,
} from "lucide-react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  StatusPill,
  INTERACTIVE_CONTROL,
  TOUCH_TARGET,
} from "@/components/shared/status-definitions";
import { cn } from "@/lib/utils";
import { ChangeCell, STATUS_TONE } from "@/lib/dashboard-shared";
import { ScoreCell, RankCell } from "@/components/shared/cells";
import { metricLabel } from "@/components/shared/metric-definitions";
import {
  FLEX_DATA_COLUMN,
  UTILITY_COLUMN,
  UNBOUNDED_COLUMN_MAX,
} from "@/components/shared/table-presets";
import {
  DataFreshnessIndicator,
  freshnessFromMinutes,
  DataGridColumnHeader,
  type SonarColumnMeta,
} from "@/components/sonar-data-grid";
import { toast } from "sonner";
import type { KeywordRecord } from "./types";

/* ---------- helpers ---------- */
function difficultyLabel(v: number): "Düşük" | "Orta" | "Yüksek" {
  return v >= 70 ? "Yüksek" : v >= 45 ? "Orta" : "Düşük";
}
const DIFF_TONE: Record<string, string> = {
  Düşük: "text-[color:var(--success)]",
  Orta: "text-[color:var(--warning)]",
  Yüksek: "text-[color:var(--danger)]",
};
function opportunityBadgeTone(v: number) {
  if (v >= 75)
    return "bg-[color:var(--success)]/12 text-[color:var(--success)] ring-[color:var(--success)]/25";
  if (v >= 55)
    return "bg-[color:var(--cobalt)]/12 text-[color:var(--cobalt)] ring-[color:var(--cobalt)]/25";
  return "bg-surface-3 text-muted-foreground ring-hairline";
}
const meta = (m: SonarColumnMeta): SonarColumnMeta => m;

/* ---------- callbacks passed from the page ---------- */
export interface KeywordColumnHandlers {
  toggleFavorite: (id: string) => void;
  toggleTracked: (id: string) => void;
  openQuickPreview: (row: KeywordRecord) => void;
  refresh: (id: string) => void;
}

/* ---------- FAVORITE BUTTON ---------- */
function FavoriteButton({
  record,
  onToggle,
}: {
  record: KeywordRecord;
  onToggle: (id: string) => void;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-row-noclick="true"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(record.id);
            }}
            aria-label={record.favorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md text-muted-foreground",
              "hover:bg-surface-2 hover:text-foreground",
              INTERACTIVE_CONTROL,
              TOUCH_TARGET,
              record.favorite && "text-[color:var(--warning)]",
            )}
          >
            <Star className={cn("h-3.5 w-3.5", record.favorite && "fill-[color:var(--warning)]")} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[11px]">
          {record.favorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ---------- TRACKING BUTTON ---------- */
function TrackingButton({
  record,
  onToggle,
}: {
  record: KeywordRecord;
  onToggle: (id: string) => void;
}) {
  const Icon = record.tracked ? Bell : BellOff;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-row-noclick="true"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(record.id);
            }}
            aria-label={record.tracked ? "Takipten Çıkar" : "Takibe Ekle"}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md text-muted-foreground",
              "hover:bg-surface-2 hover:text-foreground",
              INTERACTIVE_CONTROL,
              TOUCH_TARGET,
              record.tracked && "text-[color:var(--cobalt)]",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[11px]">
          {record.tracked ? "Takipten Çıkar" : "Takibe Ekle"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ---------- ROW ACTIONS MENU ---------- */
function RowActions({
  row,
  onOpenPreview,
  onToggleTracked,
  onToggleFavorite,
  onRefresh,
}: {
  row: KeywordRecord;
  onOpenPreview: () => void;
  onToggleTracked: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRefresh: (id: string) => void;
}) {
  const soon = (label: string) => toast(`${label} yakında etkinleşecek.`);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-row-noclick="true"
          aria-label="Satır işlemleri"
          className={cn(
            "grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground",
            INTERACTIVE_CONTROL,
            TOUCH_TARGET,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px] border-hairline bg-background">
        <DropdownMenuItem className="text-xs" onClick={onOpenPreview}>
          <Eye className="mr-2 h-3.5 w-3.5" /> Hızlı Önizlemeyi Aç
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => soon("Detaylı Analiz")}>
          <ArrowUpRight className="mr-2 h-3.5 w-3.5" /> Detaylı Analizi Aç
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs" onClick={() => onToggleTracked(row.id)}>
          <Bell className="mr-2 h-3.5 w-3.5" />
          {row.tracked ? "Takipten Çıkar" : "Takibe Ekle"}
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => onToggleFavorite(row.id)}>
          <Star className="mr-2 h-3.5 w-3.5" />
          {row.favorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => soon("Etiketleme")}>
          <Tag className="mr-2 h-3.5 w-3.5" /> Etiketle
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => soon("Gruplama")}>
          <FolderPlus className="mr-2 h-3.5 w-3.5" /> Gruba Ekle
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs" onClick={() => soon("Sıralama Geçmişi")}>
          <History className="mr-2 h-3.5 w-3.5" /> Sıralama Geçmişini Aç
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => soon("SERP İncelemesi")}>
          <Users className="mr-2 h-3.5 w-3.5" /> SERP Sonuçlarını İncele
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-xs"
          onClick={() => onRefresh(row.id)}
          disabled={row.isRefreshing}
        >
          <RefreshCw className={cn("mr-2 h-3.5 w-3.5", row.isRefreshing && "animate-spin")} />
          Veriyi Yenile
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => soon("Dışa Aktarım")}>
          <Download className="mr-2 h-3.5 w-3.5" /> Dışa Aktar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ================================================================
   KEYWORD COLUMN DEFINITIONS
================================================================ */

/**
 * Column IDs correspond to keyword-record fields where possible.
 * Locked columns: select, favorite, kw. Default-hidden columns are marked
 * with `meta.defaultVisible = false`.
 */
export const KEYWORD_COLUMNS: readonly string[] = [
  "select",
  "favorite",
  "tracking",
  "kw",
  "rank",
  "change",
  "volume",
  "difficulty",
  "relevance",
  "opportunity",
  "appStrength",
  "status",
  "bestRank",
  "worstRank",
  "sevenDayChange",
  "trend30d",
  "competitorsCount",
  "titleCompetition",
  "updatedMinutesAgo",
  "trackingFrequency",
  "tags",
  "group",
  "_actionsSpacer",
  "actions",
];

export function makeKeywordColumns(h: KeywordColumnHandlers): ColumnDef<KeywordRecord>[] {
  return [
    /* ---- SELECTION ---- */
    {
      id: "select",
      size: 40,
      minSize: 40,
      maxSize: 40,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      meta: meta({
        label: "Seçim",
        canHide: false,
        width: 40,
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
          className={cn("h-3.5 w-3.5", INTERACTIVE_CONTROL, TOUCH_TARGET)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(Boolean(v))}
          aria-label={`${row.original.kw} seç`}
          className={cn("h-3.5 w-3.5", INTERACTIVE_CONTROL, TOUCH_TARGET)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },

    /* ---- FAVORITE ---- */
    {
      id: "favorite",
      size: 44,
      minSize: 44,
      maxSize: 44,
      enableResizing: false,
      accessorFn: (r) => (r.favorite ? 1 : 0),
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
      cell: ({ row }) => <FavoriteButton record={row.original} onToggle={h.toggleFavorite} />,
    },

    /* ---- TRACKING ---- */
    {
      id: "tracking",
      size: 44,
      minSize: 44,
      maxSize: 44,
      enableResizing: false,
      accessorFn: (r) => (r.tracked ? 1 : 0),
      enableSorting: true,
      enableHiding: false,
      meta: meta({
        label: "Takip",
        canHide: false,
        width: 44,
        align: "center",
        interactive: true,
        ...UTILITY_COLUMN,
      }),
      header: () => <Bell className="mx-auto h-3.5 w-3.5 text-muted-foreground" />,
      cell: ({ row }) => <TrackingButton record={row.original} onToggle={h.toggleTracked} />,
    },

    /* ---- KEYWORD ---- */
    {
      id: "kw",
      size: 260,
      accessorKey: "kw",
      enableSorting: true,
      enableHiding: false,
      minSize: 200,
      maxSize: UNBOUNDED_COLUMN_MAX,
      meta: meta({
        label: "Anahtar Kelime",
        canHide: false,
        width: 260,
        ...FLEX_DATA_COLUMN(1),
      }),
      header: ({ column }) => <DataGridColumnHeader column={column} label="Anahtar Kelime" />,
      cell: ({ row }) => {
        const k = row.original;
        return (
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate font-medium">{k.kw}</span>
            {!k.tracked && (
              <span className="rounded border border-hairline px-1 text-[9px] font-normal text-muted-foreground">
                Takip Dışı
              </span>
            )}
          </div>
        );
      },
    },

    /* ---- RANK ---- */
    {
      id: "rank",
      size: 96,
      accessorFn: (r) => r.rank ?? Number.MAX_SAFE_INTEGER,
      sortingFn: "basic",
      meta: meta({ label: metricLabel("currentRank"), align: "right", width: 96 }),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} label="Mevcut Sıra" align="right" />
      ),
      cell: ({ row }) => <RankCell rank={row.original.rank} />,
    },

    /* ---- CHANGE ---- */
    {
      id: "change",
      size: 110,
      accessorKey: "change",
      meta: meta({ label: "Değişim", align: "right", width: 110 }),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} label="Değişim" align="right" />
      ),
      cell: ({ row }) => (
        <div className="inline-flex justify-end w-full">
          <ChangeCell change={row.original.change} />
        </div>
      ),
    },

    /* ---- VOLUME ---- */
    {
      id: "volume",
      size: 180,
      accessorKey: "volume",
      meta: meta({ label: metricLabel("estimatedVolume"), align: "right", width: 180 }),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} label="Tahmini Aranma Hacmi" align="right" />
      ),
      cell: ({ row }) => <ScoreCell value={row.original.volume} showLabel={false} />,
    },

    /* ---- DIFFICULTY ---- */
    {
      id: "difficulty",
      accessorKey: "difficulty",
      meta: meta({ label: "Zorluk", align: "right", width: 130 }),
      header: ({ column }) => <DataGridColumnHeader column={column} label="Zorluk" align="right" />,
      cell: ({ row }) => {
        return <ScoreCell value={row.original.difficulty} invert />;
      },
    },

    /* ---- RELEVANCE (default hidden) ---- */
    {
      id: "relevance",
      accessorKey: "relevance",
      meta: meta({
        label: metricLabel("relevance"),
        align: "right",
        width: 120,
        defaultVisible: false,
      }),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} label="Alaka Düzeyi" align="right" />
      ),
      cell: ({ row }) => <ScoreCell value={row.original.relevance} showLabel={false} />,
    },

    /* ---- OPPORTUNITY ---- */
    {
      id: "opportunity",
      accessorKey: "opportunity",
      size: 120,
      meta: meta({ label: "Fırsat Skoru", align: "right", width: 120 }),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} label="Fırsat Skoru" align="right" />
      ),
      cell: ({ row }) => <ScoreCell value={row.original.opportunity} />,
    },

    /* ---- APP STRENGTH (default hidden) ---- */
    {
      id: "appStrength",
      accessorKey: "appStrength",
      meta: meta({ label: "Uygulama Gücü", align: "right", width: 130, defaultVisible: false }),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} label="Uygulama Gücü" align="right" />
      ),
      cell: ({ row }) => <ScoreCell value={row.original.appStrength} showLabel={false} />,
    },

    /* ---- STATUS ---- */
    {
      id: "status",
      accessorKey: "status",
      meta: meta({ label: "Durum", width: 150 }),
      header: ({ column }) => <DataGridColumnHeader column={column} label="Durum" />,
      cell: ({ row }) => <StatusPill status={row.original.status} />,
    },

    /* ---- BEST RANK (default hidden) ---- */
    {
      id: "bestRank",
      accessorFn: (r) => r.bestRank ?? Number.MAX_SAFE_INTEGER,
      meta: meta({
        label: metricLabel("bestRank"),
        align: "right",
        width: 110,
        defaultVisible: false,
      }),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} label="En İyi Sıra" align="right" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.bestRank != null ? `#${row.original.bestRank}` : "—"}
        </span>
      ),
    },

    /* ---- WORST RANK (default hidden) ---- */
    {
      id: "worstRank",
      accessorFn: (r) => r.worstRank ?? -1,
      enableSorting: true,
      meta: meta({
        label: metricLabel("worstRank"),
        align: "right",
        width: 120,
        defaultVisible: false,
      }),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} label="En Kötü Sıra" align="right" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.worstRank != null ? `#${row.original.worstRank}` : "—"}
        </span>
      ),
    },

    /* ---- 7-DAY CHANGE (default hidden) ---- */
    {
      id: "sevenDayChange",
      accessorFn: (r) => r.sevenDayChange ?? 0,
      meta: meta({ label: "7 Günlük Değişim", align: "right", width: 150, defaultVisible: false }),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} label="7 Günlük Değişim" align="right" />
      ),
      cell: ({ row }) => (
        <div className="inline-flex justify-end w-full">
          <ChangeCell change={row.original.sevenDayChange ?? 0} />
        </div>
      ),
    },

    /* ---- 30-DAY TREND SPARK (default hidden) ---- */
    {
      id: "trend30d",
      enableSorting: false,
      meta: meta({ label: "30 Günlük Eğilim", width: 140, defaultVisible: false }),
      header: ({ column }) => <DataGridColumnHeader column={column} label="30 Günlük Eğilim" />,
      cell: ({ row }) => <MiniSpark values={row.original.trend30d} />,
    },

    /* ---- COMPETITORS COUNT (default hidden) ---- */
    {
      id: "competitorsCount",
      accessorKey: "competitorsCount",
      meta: meta({
        label: metricLabel("competitorCount"),
        align: "right",
        width: 120,
        defaultVisible: false,
      }),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} label="Rakip Sayısı" align="right" />
      ),
      cell: ({ row }) => <span className="tabular-nums">{row.original.competitorsCount}</span>,
    },

    /* ---- TITLE COMPETITION (default hidden) ---- */
    {
      id: "titleCompetition",
      accessorKey: "titleCompetition",
      meta: meta({ label: "Başlık Rekabeti", width: 140, defaultVisible: false }),
      header: ({ column }) => <DataGridColumnHeader column={column} label="Başlık Rekabeti" />,
      cell: ({ row }) => {
        const v = row.original.titleCompetition;
        const tone =
          v === "Yüksek"
            ? "text-[color:var(--danger)]"
            : v === "Orta"
              ? "text-[color:var(--warning)]"
              : "text-[color:var(--success)]";
        return <span className={cn("text-[11px] font-medium", tone)}>{v}</span>;
      },
    },

    /* ---- LAST UPDATED ---- */
    {
      id: "updatedMinutesAgo",
      accessorKey: "updatedMinutesAgo",
      meta: meta({ label: metricLabel("updatedAt"), width: 150 }),
      header: ({ column }) => <DataGridColumnHeader column={column} label="Son Güncelleme" />,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <DataFreshnessIndicator
            freshness={freshnessFromMinutes(r.updatedMinutesAgo, {
              frequency: r.trackingFrequency,
              isRefreshing: r.isRefreshing,
            })}
          />
        );
      },
    },

    /* ---- TRACKING FREQUENCY (default hidden) ---- */
    {
      id: "trackingFrequency",
      accessorKey: "trackingFrequency",
      meta: meta({ label: "Yenileme Sıklığı", width: 140, defaultVisible: false }),
      header: ({ column }) => <DataGridColumnHeader column={column} label="Yenileme Sıklığı" />,
      cell: ({ row }) => (
        <span className="rounded-md border border-hairline bg-surface/40 px-1.5 py-0.5 text-[11px]">
          {row.original.trackingFrequency}
        </span>
      ),
    },

    /* ---- TAGS (default hidden) ---- */
    {
      id: "tags",
      enableSorting: false,
      meta: meta({ label: "Etiketler", width: 180, defaultVisible: false }),
      header: () => <span>Etiketler</span>,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((t) => (
            <span
              key={t}
              className="rounded-md border border-hairline bg-surface/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      ),
    },

    /* ---- GROUP (default hidden) ---- */
    {
      id: "group",
      accessorFn: (r) => r.group ?? "",
      meta: meta({ label: "Grup", width: 140, defaultVisible: false }),
      header: ({ column }) => <DataGridColumnHeader column={column} label="Grup" />,
      cell: ({ row }) =>
        row.original.group ? (
          <span className="text-[11px] text-muted-foreground">{row.original.group}</span>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">—</span>
        ),
    },

    /* ---- SPACER — reserves footprint for right-pinned actions overlay ---- */
    {
      id: "_actionsSpacer",
      size: 48,
      minSize: 48,
      maxSize: 48,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      meta: meta({ label: "", canHide: false, width: 48, ...UTILITY_COLUMN }),
      header: () => null,
      cell: () => null,
    },

    /* ---- ROW ACTIONS ---- */
    {
      id: "actions",
      size: 48,
      minSize: 48,
      maxSize: 48,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      meta: meta({
        label: "İşlemler",
        canHide: false,
        width: 48,
        align: "center",
        interactive: true,
        ...UTILITY_COLUMN,
      }),
      header: () => null,
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onOpenPreview={() => h.openQuickPreview(row.original)}
          onToggleTracked={h.toggleTracked}
          onToggleFavorite={h.toggleFavorite}
          onRefresh={h.refresh}
        />
      ),
    },
  ];
}

/**
 * Default column visibility map — derived from `meta.defaultVisible`.
 */
export function getDefaultColumnVisibility(
  columns: ColumnDef<KeywordRecord>[],
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const c of columns) {
    const m = (c.meta ?? {}) as SonarColumnMeta;
    if (m.defaultVisible === false && c.id) out[c.id] = false;
  }
  return out;
}

export const DEFAULT_COLUMN_PINNING = {
  left: ["select", "favorite", "tracking", "kw"],
  right: ["actions"],
};

/* ---------- Tiny inline sparkline (SVG) ---------- */
function MiniSpark({ values }: { values: number[] }) {
  if (values.length < 2) return <span className="text-[10px] text-muted-foreground">—</span>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const w = 90,
    h = 22;
  const step = w / (values.length - 1);
  // Rank chart — invert (better rank = higher on chart).
  const pts = values.map((v, i) => `${i * step},${h - ((v - min) / span) * h * 0.9 - 2}`);
  const d = "M" + pts.map((p, i) => (i === 0 ? p : `L${p}`)).join(" ");
  const invertedD =
    "M" +
    values
      .map((v, i) => `${i * step},${((v - min) / span) * h * 0.9 + 2}`)
      .map((p, i) => (i === 0 ? p : `L${p}`))
      .join(" ");
  return (
    <svg width={w} height={h} className="block">
      <path d={invertedD} stroke="var(--cobalt)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export type { KeywordRecord };
export { RowActions as KeywordRowActions };
