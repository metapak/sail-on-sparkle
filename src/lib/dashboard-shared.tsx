import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SparklineChart } from "@/components/shared/charts-sparkline";
import { cn } from "@/lib/utils";

/* ================================================================
   CENTRALIZED MOCK DATA — single source of truth
================================================================ */

export type OpportunityStatus =
  | "Koru"
  | "Hızlı Kazanım"
  | "Büyüme Fırsatı"
  | "Uzun Vadeli"
  | "Çok Rekabetçi"
  | "İlgisiz";

export type ActionLabel =
  | "İncele"
  | "İçeriğe Ekle"
  | "Koru"
  | "Optimize Et"
  | "Sıra Kaybını İncele"
  | "Takip Et"
  | "Düşük Öncelik"
  | "İzle";

export interface Keyword {
  kw: string;
  rank: number | null; // null → outside top 200
  best: number;
  change: number; // + = improvement (rank went down numerically), - = decline
  volume: number; // 0-100 estimated demand score
  difficulty: number; // 0-100
  relevance: number; // 0-100
  opportunity: number; // 0-100
  status: OpportunityStatus;
  action: ActionLabel;
  appStrength: number; // 0-100 for FitLoop against this keyword
  tracked: boolean;
}

export const DEMO = {
  app: "FitLoop — Günlük Fitness",
  store: "App Store",
  country: "Türkiye",
  period: "Son 30 Gün",
  updatedAgo: "12 dakika önce",

  kpis: {
    visibility: {
      value: 74,
      delta: "+12 puan",
      trend: "up" as const,
      note: "Son 30 günde +12 puan",
    },
    tracked: {
      value: 248,
      delta: "18 anahtar kelimede sıralama değişti",
      trend: "neutral" as const,
    },
    opportunities: { value: 12, delta: "5 yeni fırsat tespit edildi", trend: "up" as const },
    searchDownloads: {
      value: "10,2 bin",
      delta: "+%21",
      trend: "up" as const,
      note: "Son 30 günde +%21",
    },
  },

  visibilitySeries: [
    62, 63, 61, 64, 65, 64, 66, 67, 66, 68, 69, 68, 70, 71, 70, 72, 71, 72, 73, 72, 73, 74, 73, 74,
    75, 74, 73, 74, 74, 74,
  ],
  rankSeries: [
    38, 38, 37, 37, 36, 36, 35, 35, 34, 34, 33, 33, 32, 32, 31, 31, 30, 30, 29, 29, 28, 28, 27, 27,
    27, 26, 26, 26, 26, 26,
  ],
  downloadsSeries: [
    8.4, 8.5, 8.3, 8.6, 8.7, 8.8, 8.6, 8.9, 9.0, 9.1, 9.0, 9.2, 9.3, 9.2, 9.4, 9.5, 9.4, 9.6, 9.7,
    9.8, 9.7, 9.9, 10.0, 9.9, 10.1, 10.2, 10.1, 10.2, 10.2, 10.2,
  ],

  keywords: [
    {
      kw: "kalori sayacı",
      rank: 18,
      best: 14,
      change: 12,
      volume: 78,
      difficulty: 54,
      relevance: 94,
      opportunity: 86,
      status: "Hızlı Kazanım",
      action: "İncele",
      appStrength: 67,
      tracked: true,
    },
    {
      kw: "adım sayar",
      rank: 24,
      best: 21,
      change: 6,
      volume: 72,
      difficulty: 48,
      relevance: 91,
      opportunity: 82,
      status: "Hızlı Kazanım",
      action: "İçeriğe Ekle",
      appStrength: 67,
      tracked: true,
    },
    {
      kw: "günlük fitness",
      rank: 7,
      best: 6,
      change: 0,
      volume: 64,
      difficulty: 57,
      relevance: 88,
      opportunity: 58,
      status: "Koru",
      action: "Koru",
      appStrength: 67,
      tracked: true,
    },
    {
      kw: "evde egzersiz",
      rank: 42,
      best: 34,
      change: -5,
      volume: 81,
      difficulty: 72,
      relevance: 76,
      opportunity: 61,
      status: "Büyüme Fırsatı",
      action: "İncele",
      appStrength: 63,
      tracked: true,
    },
    {
      kw: "kilo takibi",
      rank: 31,
      best: 22,
      change: 9,
      volume: 75,
      difficulty: 63,
      relevance: 84,
      opportunity: 74,
      status: "Büyüme Fırsatı",
      action: "Optimize Et",
      appStrength: 65,
      tracked: true,
    },
    {
      kw: "antrenman planı",
      rank: 56,
      best: 42,
      change: 14,
      volume: 69,
      difficulty: 58,
      relevance: 79,
      opportunity: 70,
      status: "Büyüme Fırsatı",
      action: "Optimize Et",
      appStrength: 62,
      tracked: true,
    },
    {
      kw: "koşu takibi",
      rank: 12,
      best: 10,
      change: -2,
      volume: 66,
      difficulty: 61,
      relevance: 82,
      opportunity: 64,
      status: "Koru",
      action: "Sıra Kaybını İncele",
      appStrength: 66,
      tracked: true,
    },
    {
      kw: "sağlıklı yaşam",
      rank: 93,
      best: 87,
      change: 0,
      volume: 71,
      difficulty: 76,
      relevance: 68,
      opportunity: 45,
      status: "Uzun Vadeli",
      action: "Takip Et",
      appStrength: 58,
      tracked: false,
    },
    {
      kw: "kalori takip",
      rank: 15,
      best: 12,
      change: 4,
      volume: 61,
      difficulty: 46,
      relevance: 90,
      opportunity: 80,
      status: "Hızlı Kazanım",
      action: "İncele",
      appStrength: 68,
      tracked: true,
    },
    {
      kw: "evde fitness",
      rank: 67,
      best: 58,
      change: 7,
      volume: 59,
      difficulty: 53,
      relevance: 73,
      opportunity: 62,
      status: "Büyüme Fırsatı",
      action: "İçeriğe Ekle",
      appStrength: 61,
      tracked: true,
    },
    {
      kw: "günlük adım sayacı",
      rank: 29,
      best: 24,
      change: 11,
      volume: 55,
      difficulty: 39,
      relevance: 95,
      opportunity: 84,
      status: "Hızlı Kazanım",
      action: "İncele",
      appStrength: 69,
      tracked: true,
    },
    {
      kw: "fitness uygulaması",
      rank: 103,
      best: 88,
      change: -8,
      volume: 84,
      difficulty: 82,
      relevance: 80,
      opportunity: 38,
      status: "Çok Rekabetçi",
      action: "Düşük Öncelik",
      appStrength: 55,
      tracked: false,
    },
  ] as Keyword[],

  keywordSummary: {
    tracked: 248,
    top10: 34,
    rising: 18,
    falling: 7,
    highOpportunity: 12,
    newOpportunities: 5,
    criticalLosses: 3,
  },

  metadata: {
    appName: "FitLoop — Günlük Fitness",
    subtitle: "Kalori sayacı ve adımsayar",
    keywordField: "fitness,kalori,adım,antrenman,koşu,spor,vücut",
    description:
      "FitLoop; günlük egzersiz, kalori sayacı, adım sayar ve antrenman planı özellikleriyle sağlıklı yaşam yolculuğunuzu tek uygulamada toplar.",
  },

  serpCompetitors: [
    { name: "FitTrack Pro", rank: 1, appStrength: 92, titleMatch: "Tam" as const },
    { name: "CalorieMate", rank: 2, appStrength: 88, titleMatch: "Tam" as const },
    { name: "MacroLog", rank: 3, appStrength: 84, titleMatch: "Kısmi" as const },
    { name: "StepDaily", rank: 4, appStrength: 79, titleMatch: "Yok" as const },
    { name: "HealthPilot", rank: 5, appStrength: 76, titleMatch: "Kısmi" as const },
  ],

  competitors: [
    {
      name: "FitTrack Pro",
      event: "Mağaza bilgileri güncellendi",
      meta: "3 alan değişti",
      ago: "2 gün önce",
      tone: "amber" as const,
    },
    {
      name: "CalorieMate",
      event: "Ekran görüntüleri yenilendi",
      meta: "5 kreatif değişti",
      ago: "4 gün önce",
      tone: "blue" as const,
    },
    {
      name: "StepDaily",
      event: "14 anahtar kelimede sıralama artışı",
      meta: "Organik hareket",
      ago: "7 gün önce",
      tone: "green" as const,
    },
  ],
  markets: [
    {
      country: "Suudi Arabistan",
      score: 92,
      label: "En Güçlü Fırsat",
      demand: 88,
      competition: 42,
      rankability: 81,
    },
    {
      country: "Birleşik Arap Emirlikleri",
      score: 86,
      label: "Yükselen Pazar",
      demand: 79,
      competition: 46,
      rankability: 74,
    },
    {
      country: "Türkiye",
      score: 78,
      label: "Güçlü Mevcut Pazar",
      demand: 82,
      competition: 58,
      rankability: 71,
    },
  ],
};

/* ================================================================
   SHARED UI
================================================================ */
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-hairline bg-surface/50 p-4 sm:p-5", className)}>
      {children}
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  right,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h2 className="font-editorial text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        {sub && <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function DeltaPill({
  trend,
  children,
}: {
  trend: "up" | "down" | "neutral";
  children: React.ReactNode;
}) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const color =
    trend === "up"
      ? "text-[color:var(--success)] bg-[color:var(--success)]/10"
      : trend === "down"
        ? "text-[color:var(--danger)] bg-[color:var(--danger)]/10"
        : "text-[color:var(--cobalt)] bg-[color:var(--cobalt)]/10";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        color,
      )}
    >
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}

export function ChangeCell({ change }: { change: number }) {
  if (change === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        Stabil
      </span>
    );
  }
  const up = change > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
        up ? "text-[color:var(--success)]" : "text-[color:var(--danger)]",
      )}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}
      {change} sıra
    </span>
  );
}

export function ScoreBar({
  value,
  tone = "cobalt",
}: {
  value: number;
  tone?: "cobalt" | "amber" | "success" | "violet";
}) {
  const color =
    tone === "amber"
      ? "var(--warning)"
      : tone === "success"
        ? "var(--success)"
        : tone === "violet"
          ? "var(--violet)"
          : "var(--cobalt)";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}

/**
 * Compact inline trend. Thin re-export of the shared sparkline renderer so
 * this module never touches a chart engine directly.
 */
export const Sparkline = SparklineChart;

export const STATUS_TONE: Record<OpportunityStatus, string> = {
  "Hızlı Kazanım":
    "bg-[color:var(--success)]/12 text-[color:var(--success)] ring-[color:var(--success)]/25",
  "Büyüme Fırsatı":
    "bg-[color:var(--cobalt)]/12 text-[color:var(--cobalt)] ring-[color:var(--cobalt)]/25",
  Koru: "bg-[color:var(--violet)]/12 text-[color:var(--violet)] ring-[color:var(--violet)]/25",
  "Uzun Vadeli": "bg-surface-3 text-muted-foreground ring-hairline",
  "Çok Rekabetçi":
    "bg-[color:var(--warning)]/12 text-[color:var(--warning)] ring-[color:var(--warning)]/25",
  İlgisiz: "bg-surface-3 text-muted-foreground ring-hairline",
};

export const ACTION_TONE: Record<string, string> = {
  İncele: "bg-[color:var(--cobalt)]/12 text-[color:var(--cobalt)] ring-[color:var(--cobalt)]/25",
  "İçeriğe Ekle":
    "bg-[color:var(--cobalt)]/12 text-[color:var(--cobalt)] ring-[color:var(--cobalt)]/25",
  "Optimize Et":
    "bg-[color:var(--success)]/12 text-[color:var(--success)] ring-[color:var(--success)]/25",
  Koru: "bg-[color:var(--violet)]/12 text-[color:var(--violet)] ring-[color:var(--violet)]/25",
  "Sıra Kaybını İncele":
    "bg-[color:var(--danger)]/12 text-[color:var(--danger)] ring-[color:var(--danger)]/25",
  "Takip Et": "bg-surface-3 text-muted-foreground ring-hairline",
  "Düşük Öncelik": "bg-surface-3 text-muted-foreground ring-hairline",
  İzle: "bg-surface-3 text-muted-foreground ring-hairline",
};

/* ================================================================
   HELPERS
================================================================ */
export function rankLabel(rank: number | null): string {
  if (rank == null) return "Top 200 İçinde Bulunamadı";
  return `#${rank}`;
}

// Deterministic rank history for a keyword — ends at current rank, starts at (rank + change).
export function makeRankHistory(
  kw: Keyword,
  days: 30 | 90,
): { i: number; v: number; label: string }[] {
  const currentRank = kw.rank ?? 200;
  const startRank = Math.max(1, currentRank + kw.change);
  // For 90 days, extrapolate further back with slightly larger variance.
  const total = days;
  const anchorRank = days === 90 ? Math.max(1, startRank + Math.round(kw.change * 1.5)) : startRank;
  const today = new Date();
  const out: { i: number; v: number; label: string }[] = [];
  for (let i = 0; i < total; i++) {
    const t = i / (total - 1);
    const smooth = anchorRank + (currentRank - anchorRank) * t;
    // Seeded wobble to avoid perfectly straight line without hydration issues.
    const seed = (kw.kw.length * 13 + i * 7) % 11;
    const wobble = (seed - 5) * 0.35;
    const v = Math.max(1, Math.round(smooth + wobble));
    const d = new Date(today);
    d.setDate(d.getDate() - (total - 1 - i));
    out.push({ i, v, label: `${d.getDate()}.${d.getMonth() + 1}` });
  }
  // Ensure last point exactly equals current rank
  if (out.length > 0) out[out.length - 1].v = currentRank;
  return out;
}

export function coverageForKeyword(kw: string) {
  // Explicit spec-defined coverage for the default keyword
  if (kw === "kalori sayacı") {
    return {
      appName: "Kısmi Kapsam",
      subtitle: "Kapsanmıyor",
      keywordField: "Yakın Varyasyon",
      description: "Güçlü Kapsam",
      note: "Tam eşleşme “kalori sayacı” alt başlıkta serbest metin olarak görünüyor ancak anahtar kelime alanında tam olarak yer almıyor.",
    };
  }
  const lower = kw.toLowerCase();
  const tokens = lower.split(/\s+/);
  const kwField = DEMO.metadata.keywordField.toLowerCase().split(",");
  const nameHas = DEMO.metadata.appName.toLowerCase().includes(lower);
  const subHas = DEMO.metadata.subtitle.toLowerCase().includes(lower);
  const descHas = DEMO.metadata.description.toLowerCase().includes(lower);
  const kwFieldExact = kwField.includes(lower);
  const kwFieldPartial = tokens.some((t) => kwField.includes(t));
  return {
    appName: nameHas ? "Kısmi Kapsam" : "Kapsanmıyor",
    subtitle: subHas ? "Güçlü Kapsam" : "Kapsanmıyor",
    keywordField: kwFieldExact ? "Tam Eşleşme" : kwFieldPartial ? "Yakın Varyasyon" : "Kapsanmıyor",
    description: descHas ? "Güçlü Kapsam" : "Kısmi Kapsam",
    note: kwFieldExact
      ? "Tam eşleşme anahtar kelime alanında yer alıyor; kapsamı koruyun."
      : kwFieldPartial
        ? "Yakın varyasyon kapsanıyor; tam eşleşme eklenmesi görünürlüğü güçlendirebilir."
        : "Anahtar kelime mağaza metinlerinde bulunmuyor; kapsam eklenmesi önerilir.",
  };
}

export const COVERAGE_TONE: Record<string, string> = {
  "Güçlü Kapsam":
    "bg-[color:var(--success)]/12 text-[color:var(--success)] ring-[color:var(--success)]/25",
  "Tam Eşleşme":
    "bg-[color:var(--success)]/12 text-[color:var(--success)] ring-[color:var(--success)]/25",
  "Kısmi Kapsam":
    "bg-[color:var(--warning)]/12 text-[color:var(--warning)] ring-[color:var(--warning)]/25",
  "Yakın Varyasyon":
    "bg-[color:var(--warning)]/12 text-[color:var(--warning)] ring-[color:var(--warning)]/25",
  Kapsanmıyor:
    "bg-[color:var(--danger)]/12 text-[color:var(--danger)] ring-[color:var(--danger)]/25",
};
