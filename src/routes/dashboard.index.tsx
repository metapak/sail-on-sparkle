import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";
import type { Column, ColumnDef } from "@tanstack/react-table";
import type { DashboardKeyword } from "@/hooks/queries/use-dashboard-summary";
import { overviewKeywordColumns } from "@/lib/keywords/overview-columns";
import {
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  MapPin,
  MessageSquareWarning,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboardSummaryData } from "@/hooks/queries/use-dashboard-summary";
import {
  Panel,
  SectionHead,
  DeltaPill,
  SharedSparkline,
  ChangeCell,
  ScoreBar,
  STATUS_TONE,
  ACTION_TONE,
  rankLabel,
  MetricCard,
  PageHeader,
  ChartCard,
  StandardAreaChart,
  MiniRankChart,
  type MetricFormatKind,
  DashboardPage,
  SegmentedControl,
  SharedDataTable,
  DataGridColumnManager,
  useTablePreferences,
  SharedMetricHeader,
} from "@/components/shared";
import {
  ANALYTICAL_VARIANT,
  ANALYTICAL_CARD,
  ANALYTICAL_CARD_FLUSH,
  ANALYTICAL_NESTED,
  ANALYTICAL_KPI,
  ANALYTICAL_TABLE,
  ANALYTICAL_SECTION_HEAD,
} from "@/design/analytical";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Genel Bakış — Sonar Dashboard" },
      {
        name: "description",
        content: "FitLoop ASO çalışma alanı — genel bakış, anahtar kelime, rakip ve pazar zekâsı.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardOverview,
});

const CHART_HEIGHT_TREND = 256;

/**
 * Overview uses the shared analytical variant — no route-scoped visual system.
 * Only composition (which surface goes where) is local to this page.
 */
const OV_CARD = ANALYTICAL_CARD;
const OV_INNER = ANALYTICAL_NESTED;

function KpiCards() {
  const DEMO = useDashboardSummaryData();
  const items: React.ComponentProps<typeof MetricCard>[] = [
    {
      label: "Görünürlük Skoru",
      value: "74",
      suffix: "/100",
      note: DEMO.kpis.visibility.note,
      trend: "up",
      delta: "+12 puan",
      series: DEMO.visibilitySeries,
      seriesColor: "var(--cobalt)",
    },
    {
      label: "Takip Edilen Anahtar Kelimeler",
      value: "248",
      note: DEMO.kpis.tracked.delta,
      trend: "neutral",
      delta: "18 değişim",
    },
    {
      label: "Yüksek Fırsatlı Anahtar Kelimeler",
      value: "12",
      note: DEMO.kpis.opportunities.delta,
      trend: "up",
      delta: "+5 yeni",
    },
    {
      label: "Arama Kaynaklı İndirmeler",
      value: "10,2 bin",
      note: DEMO.kpis.searchDownloads.note!,
      trend: "up",
      delta: "+%21",
      series: DEMO.downloadsSeries,
      seriesColor: "var(--success)",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((k) => (
        <MetricCard key={k.label} {...k} className={cn(ANALYTICAL_KPI, "h-full")} />
      ))}
    </div>
  );
}

function TodoSection() {
  const items = [
    {
      icon: Target,
      tone: "cobalt",
      eyebrow: "Anahtar Kelime Fırsatı",
      title: "8 yeni anahtar kelime fırsatı tespit edildi",
      metric: "Ortalama fırsat skoru: 78",
      cta: "Fırsatları İncele",
    },
    {
      icon: Layers,
      tone: "amber",
      eyebrow: "Rakip Değişikliği",
      title: "FitTrack Pro mağaza bilgilerini güncelledi",
      metric: "3 alan değişti",
      cta: "Değişikliği İncele",
    },
    {
      icon: MapPin,
      tone: "violet",
      eyebrow: "Pazar Fırsatı",
      title: "Suudi Arabistan'da güçlü bir genişleme fırsatı oluştu",
      metric: "Fırsat puanı: 92/100",
      cta: "Pazarı İncele",
    },
    {
      icon: MessageSquareWarning,
      tone: "danger",
      eyebrow: "Yorum Sinyali",
      title: "Rakip yorumlarında giriş sorunları hızla artıyor",
      metric: "Son 7 günde 28 yorum",
      cta: "Yorumları İncele",
    },
  ];
  const toneMap: Record<string, string> = {
    cobalt: "bg-primary/10 text-primary ring-[color:var(--cobalt)]/25",
    amber:
      "bg-[color:var(--warning)]/10 text-[color:var(--warning)] ring-[color:var(--warning)]/25",
    violet: "bg-accent-brand/10 text-[color:var(--violet)] ring-[color:var(--violet)]/25",
    danger: "bg-[color:var(--danger)]/10 text-[color:var(--danger)] ring-[color:var(--danger)]/25",
  };
  return (
    <section>
      <SectionHead
        eyebrow="ÖNCELİKLİ AKSİYONLAR"
        title="Bugün Ne Yapmalısın?"
        sub="Öncelikli büyüme sinyallerini inceleyin ve doğrudan ilgili çalışma alanına geçin."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((it) => (
          <Panel key={it.eyebrow} className={cn(OV_CARD, "flex h-full flex-col gap-3 p-5")}>
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1",
                  toneMap[it.tone],
                )}
              >
                <it.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {it.eyebrow}
                </div>
                <div className="mt-0.5 text-sm font-medium leading-snug">{it.title}</div>
              </div>
            </div>
            <div className="mt-auto text-xs text-muted-foreground">{it.metric}</div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full justify-between border-hairline bg-surface/40 px-3 text-xs font-medium hover:bg-surface-2"
            >
              {it.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Panel>
        ))}
      </div>
    </section>
  );
}

type MetricKey = "visibility" | "rank" | "downloads";

function PerformancePanel() {
  const DEMO = useDashboardSummaryData();
  const METRICS: Record<
    MetricKey,
    {
      label: string;
      series: number[];
      color: string;
      reversed?: boolean;
      format: (v: number) => string;
      formatKind: MetricFormatKind;
      summary: string;
      delta: string;
      trend: "up" | "down" | "neutral";
    }
  > = {
    visibility: {
      label: "Görünürlük",
      series: DEMO.visibilitySeries,
      color: "var(--cobalt)",
      format: (v) => v.toFixed(0),
      formatKind: "number",
      summary: "74 / 100",
      delta: "+12 puan",
      trend: "up",
    },
    rank: {
      label: "Ortalama Sıralama",
      series: DEMO.rankSeries,
      color: "var(--violet)",
      reversed: true,
      format: (v) => `#${v.toFixed(0)}`,
      formatKind: "rank",
      summary: "#26",
      delta: "12 sıra yükseldi",
      trend: "up",
    },
    downloads: {
      label: "Arama Kaynaklı İndirmeler",
      series: DEMO.downloadsSeries,
      color: "var(--success)",
      format: (v) => `${v.toFixed(1)} bin`,
      formatKind: "compact",
      summary: "10,2 bin",
      delta: "+%21",
      trend: "up",
    },
  };
  const [metric, setMetric] = React.useState<MetricKey>("visibility");
  const m = METRICS[metric];
  const today = new Date();
  const data = m.series.map((v, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (m.series.length - 1 - i));
    return { label: `${d.getDate()}.${d.getMonth() + 1}`, value: v };
  });
  return (
    <ChartCard
      className={cn(OV_CARD, "p-5")}
      eyebrow="PERFORMANS EĞİLİMİ · SON 30 GÜN"
      title={m.label}
      description={`${DEMO.app} · ${DEMO.country}`}
      value={m.summary}
      delta={m.delta}
      deltaDirection={m.trend}
      deltaPolarity={m.reversed ? "negative" : "positive"}
      height={CHART_HEIGHT_TREND}
      isEmpty={data.length === 0}
      actions={
        <SegmentedControl
          value={metric}
          onChange={(v) => setMetric(v as MetricKey)}
          options={(Object.keys(METRICS) as MetricKey[]).map((k) => ({
            value: k,
            label: METRICS[k].label,
          }))}
          size="sm"
        />
      }
    >
      <StandardAreaChart
        data={data}
        seriesLabel={m.label}
        color={m.color}
        reversed={m.reversed}
        format={m.formatKind}
        height={CHART_HEIGHT_TREND}
      />
    </ChartCard>
  );
}

function KeywordSection() {
  const DEMO = useDashboardSummaryData();
  const [selected, setSelected] = React.useState(DEMO.keywords[0]);

  const rankHistory = React.useMemo(() => {
    const currentRank = selected.rank ?? 200;
    const start = Math.max(1, currentRank + selected.change);
    const steps = 30;
    return Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1);
      const v = start + (currentRank - start) * t + Math.sin(i * 0.9) * 0.6;
      return { i, v: Math.max(1, Math.round(v)) };
    });
  }, [selected]);

  const overviewRows = React.useMemo(() => DEMO.keywords.slice(0, 8), [DEMO.keywords]);

  /**
   * Route-scoped header presentation only: the two longest metric labels use
   * the shared dictionary's approved compact form so the header never needs a
   * third line inside this summary table. Column ids, widths, roles, sorting,
   * meta and cells are untouched (spread from the shared preset).
   */
  const overviewColumns = React.useMemo(
    () =>
      overviewKeywordColumns.map((col) => {
        const shortFor: Record<string, string> = {
          rank: "currentRank",
          volume: "estimatedVolume",
        };
        const metricKey = col.id ? shortFor[col.id] : undefined;
        if (!metricKey) return col;
        return {
          ...col,
          header: ({ column }: { column: Column<DashboardKeyword, unknown> }) => (
            <SharedMetricHeader
              column={column}
              metricKey={metricKey}
              useShortLabel
              align={
                (col.meta as { align?: "left" | "right" | "center" } | undefined)?.align ?? "left"
              }
            />
          ),
        } as ColumnDef<DashboardKeyword>;
      }),
    [],
  );

  /* Summary preset — same shared engine, table-scoped persisted preferences. */
  const prefs = useTablePreferences("overview-priority-keywords", {
    defaultDensity: "comfortable",
  });

  const overviewTable = useReactTable({
    data: overviewRows,
    columns: overviewColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
    state: { columnSizing: prefs.columnSizing },
    onColumnSizingChange: prefs.setColumnSizing,
    initialState: {
      // Keyword identity stays anchored under compact so scrolling metric
      // columns never leaves the row without a reference. The responsive
      // pinning policy in SonarDataGrid releases it automatically when the
      // measured container drops below the minimum centre viewport.
      columnPinning: { left: ["kw"], right: [] },
    },
  });

  return (
    <section className={ANALYTICAL_CARD_FLUSH}>
      <div
        className={cn(
          "flex flex-wrap items-end justify-between gap-2 border-b border-[color:var(--border)] px-5 py-4",
          ANALYTICAL_SECTION_HEAD,
        )}
      >
        <SectionHead
          eyebrow="ANAHTAR KELİMELER"
          title="Öncelikli Anahtar Kelime Fırsatları"
          sub="Uygulamanızın mevcut gücüne ve sıralama durumuna göre önceliklendirilen anahtar kelimeler."
        />
        <DataGridColumnManager
          table={overviewTable}
          onReset={prefs.resetAll}
          onResetWidths={prefs.resetWidths}
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className={cn(ANALYTICAL_TABLE, "min-w-0")}>
          <SharedDataTable
            table={overviewTable}
            density={prefs.density}
            onRowClick={(row) => setSelected(row)}
            isRowActive={(row) => row.kw === selected.kw}
            onColumnWidthCommit={prefs.commitColumnWidth}
            emptyTitle="Anahtar kelime bulunamadı"
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-[color:var(--border)] bg-surface/25 p-5 xl:border-l xl:border-t-0">
          <div>
            <div className="eyebrow mb-1">SEÇİLİ ANAHTAR KELİME</div>
            <div className="font-editorial text-xl font-semibold tracking-tight">{selected.kw}</div>
            <p className="mt-1 text-xs text-muted-foreground">Alaka: {selected.relevance}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(OV_INNER, "p-2.5")}>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Mevcut Sıra
              </div>
              <div className="mt-0.5 font-editorial text-lg font-semibold tabular-nums">
                {rankLabel(selected.rank)}
              </div>
            </div>
            <div className={cn(OV_INNER, "p-2.5")}>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                En İyi Sıra
              </div>
              <div className="mt-0.5 font-editorial text-lg font-semibold tabular-nums">
                #{selected.best}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              30 Günlük Sıralama
            </div>
            <MiniRankChart data={rankHistory} height={80} />
          </div>
          <div className="space-y-2">
            <DetailRow label="Tahmini Aranma Hacmi" value={selected.volume} tone="cobalt" />
            <DetailRow label="Zorluk" value={selected.difficulty} tone="amber" />
            <DetailRow label="Fırsat Skoru" value={selected.opportunity} tone="success" />
          </div>
          <div className={cn(OV_INNER, "p-3 text-xs leading-relaxed text-muted-foreground")}>
            Mevcut sıralamanız <span className="text-foreground">{rankLabel(selected.rank)}</span>.
            Anahtar kelimenin talebi yüksek, zorluk seviyesi ise uygulama gücünüzle uyumlu. İlk 10'a
            yaklaşmak için alt başlık ve kısa açıklama kapsamını güçlendirin.
          </div>
          <div className="mt-auto flex items-center justify-between gap-2">
            <span
              className={cn(
                "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ring-1",
                ACTION_TONE[selected.action],
              )}
            >
              Önerilen: {selected.action}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-hairline bg-surface/40 px-3 text-xs"
            >
              Detaya Git
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "cobalt" | "amber" | "success";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <ScoreBar value={value} tone={tone} />
    </div>
  );
}

function CompetitorMoves() {
  const DEMO = useDashboardSummaryData();
  const toneColor: Record<string, string> = {
    amber: "bg-[color:var(--warning)]",
    blue: "bg-primary",
    green: "bg-[color:var(--success)]",
  };
  return (
    <Panel className={cn(OV_CARD, "flex h-full flex-col p-5")}>
      <div className="mb-3">
        <div className="eyebrow mb-1">RAKİPLER</div>
        <h3 className="font-editorial text-base font-semibold tracking-tight">Rakip Hareketleri</h3>
      </div>
      <ul className="flex-1 space-y-3">
        {DEMO.competitors.map((c) => (
          <li key={c.name} className={cn(OV_INNER, "flex gap-3 p-3")}>
            <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface-2 text-[10px] font-semibold ring-1 ring-hairline">
              {c.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium">{c.name}</span>
                <span className={cn("h-1.5 w-1.5 rounded-full", toneColor[c.tone])} />
                <span className="text-[11px] text-muted-foreground">{c.ago}</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{c.event}</div>
              <div className="mt-1 text-[11px] text-foreground/70">{c.meta}</div>
            </div>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 h-8 justify-between border-hairline bg-surface/40 px-3 text-xs"
      >
        Tüm Rakip Hareketlerini Gör
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </Panel>
  );
}

function MarketOpps() {
  const DEMO = useDashboardSummaryData();
  return (
    <Panel className={cn(OV_CARD, "flex h-full flex-col p-5")}>
      <div className="mb-3">
        <div className="eyebrow mb-1">PAZARLAR</div>
        <h3 className="font-editorial text-base font-semibold tracking-tight">Pazar Fırsatları</h3>
      </div>
      <ul className="flex-1 space-y-3">
        {DEMO.markets.map((m) => (
          <li key={m.country} className={cn(OV_INNER, "p-3")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">{m.country}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{m.label}</div>
              </div>
              <div className="text-right">
                <div className="font-editorial text-lg font-semibold tabular-nums">
                  {m.score}
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  FIRSAT PUANI
                </div>
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px]">
              <MiniStat label="Talep" value={m.demand} tone="success" />
              <MiniStat label="Rekabet" value={m.competition} tone="amber" />
              <MiniStat label="Sıralama Potansiyeli" value={m.rankability} tone="cobalt" />
            </div>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 h-8 justify-between border-hairline bg-surface/40 px-3 text-xs"
      >
        Tüm Pazarları İncele
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </Panel>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "cobalt" | "amber" | "success";
}) {
  const color =
    tone === "amber" ? "var(--warning)" : tone === "success" ? "var(--success)" : "var(--cobalt)";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="tabular-nums text-foreground">{value}</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

function ReviewSignals() {
  const items = [
    {
      title: "En Hızlı Artan Şikâyet",
      subject: "Abonelik Fiyatları",
      meta: "Son 30 günde +%38",
      tone: "red" as const,
      icon: AlertTriangle,
    },
    {
      title: "En Çok İstenen Özellik",
      subject: "Çevrimdışı Kullanım",
      meta: "842 talep",
      tone: "green" as const,
      icon: CheckCircle2,
    },
    {
      title: "Rakipte Öne Çıkan Sorun",
      subject: "Giriş Sorunları",
      meta: "Son 7 günde 28 yorum",
      tone: "amber" as const,
      icon: MessageSquareWarning,
    },
  ];
  const toneMap: Record<string, string> = {
    red: "text-[color:var(--danger)] bg-[color:var(--danger)]/10 ring-[color:var(--danger)]/25",
    green:
      "text-[color:var(--success)] bg-[color:var(--success)]/10 ring-[color:var(--success)]/25",
    amber:
      "text-[color:var(--warning)] bg-[color:var(--warning)]/10 ring-[color:var(--warning)]/25",
  };
  return (
    <Panel className={cn(OV_CARD, "flex h-full flex-col p-5")}>
      <div className="mb-3">
        <div className="eyebrow mb-1">YORUMLAR</div>
        <h3 className="font-editorial text-base font-semibold tracking-tight">Yorum Sinyalleri</h3>
      </div>
      <ul className="flex-1 space-y-3">
        {items.map((r) => (
          <li key={r.title} className={cn(OV_INNER, "flex gap-3 p-3")}>
            <div
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1",
                toneMap[r.tone],
              )}
            >
              <r.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {r.title}
              </div>
              <div className="mt-0.5 text-sm font-medium">{r.subject}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{r.meta}</div>
            </div>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 h-8 justify-between border-hairline bg-surface/40 px-3 text-xs"
      >
        Yorum Analizini Aç
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </Panel>
  );
}

function AIAdvisor() {
  return (
    <Panel className={cn(OV_CARD, "border-[color:var(--violet)]/25 p-5")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-brand/15 ring-1 ring-[color:var(--violet)]/30">
            <Sparkles className="h-5 w-5 text-[color:var(--violet)]" />
          </div>
          <div className="min-w-0 max-w-2xl">
            <div className="eyebrow mb-1">YAPAY ZEKÂ</div>
            <h3 className="font-editorial text-lg font-semibold tracking-tight">
              Yapay Zekâ Büyüme Danışmanı
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bugünkü büyüme fırsatınızı üç temel sinyal özetliyor. Öncelikle anahtar kelime
              fırsatlarını incelemenizi öneriyoruz.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="h-8 bg-accent-brand/90 px-3 text-xs text-primary-foreground hover:bg-accent-brand"
        >
          İçgörüyü İncele
          <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {[
          { icon: Target, text: "8 yeni anahtar kelime fırsatı" },
          { icon: MapPin, text: "Suudi Arabistan fırsat puanı 92" },
          { icon: MessageSquareWarning, text: "Rakip yorumlarında giriş sorunları artıyor" },
        ].map((s) => (
          <div key={s.text} className={cn(OV_INNER, "flex items-center gap-2.5 px-3 py-2.5")}>
            <s.icon className="h-4 w-4 text-[color:var(--violet)]" />
            <span className="text-xs">{s.text}</span>
          </div>
        ))}
      </div>
      <div className={cn(OV_INNER, "mt-4 p-3 text-sm")}>
        <span className="font-medium">Öneri · </span>
        <span className="text-muted-foreground">
          Kalori sayacı ve adım sayar anahtar kelimeleri mevcut uygulama gücünüzle uyumlu en güçlü
          kısa vadeli fırsatlar olarak öne çıkıyor.
        </span>
      </div>
      <div className="mt-3 flex items-start gap-2 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>Yapay zekâ metrik üretmez; doğrulanmış verileri yorumlar.</span>
      </div>
    </Panel>
  );
}

function DashboardOverview() {
  // Silence unused warnings in strict mode
  void TrendingUp;
  void TrendingDown;
  void Minus;
  return (
    <DashboardPage className={cn(ANALYTICAL_VARIANT, "space-y-5")}>
      {/* Scope (app · store · country · date range) lives ONLY in the global
          sticky header — the page no longer echoes it. */}
      <PageHeader
        eyebrow="GENEL BAKIŞ"
        title="Genel Bakış"
        description="Uygulamanızdaki önemli büyüme sinyallerini ve öncelikli aksiyonları tek ekrandan inceleyin."
      />

      <KpiCards />
      <TodoSection />
      <PerformancePanel />
      <KeywordSection />

      <section>
        <SectionHead
          eyebrow="ZEKÂ PANELLERİ"
          title="Sinyaller ve Fırsatlar"
          sub="Rakiplerden, pazarlardan ve kullanıcı yorumlarından gelen özet zekâ."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CompetitorMoves />
          <MarketOpps />
          <ReviewSignals />
        </div>
      </section>

      <AIAdvisor />
    </DashboardPage>
  );
}
