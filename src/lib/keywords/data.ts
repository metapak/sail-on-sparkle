import { DEMO, type Keyword } from "@/lib/dashboard-shared";
import { getKeywordHistory, summarizeRange } from "@/lib/sonar-charts/keyword-history";
import type { KeywordRecord, TrackingFrequency, TitleCompetition } from "./types";

const FREQ_CYCLE: TrackingFrequency[] = [
  "Günlük",
  "3 Günde Bir",
  "Haftalık",
  "Günlük",
  "Aylık",
  "İsteğe Bağlı",
];

const GROUP_POOL = ["Çekirdek", "Kalori & Beslenme", "Adım & Aktivite", "Rakip Terimleri"];
const TAGS_POOL = [
  ["yüksek-hacim"],
  ["hızlı-kazanım"],
  ["marka-yakın"],
  ["rekabetçi"],
  ["uzun-vadeli"],
];

export function slugify(kw: string): string {
  return kw
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Derive extended KeywordRecord[] from the shared DEMO mock — deterministic.
 */
export function deriveKeywordRecords(source: Keyword[] = DEMO.keywords): KeywordRecord[] {
  return source.map((k) => extendKeyword(k));
}

export function extendKeyword(k: Keyword): KeywordRecord {
  const id = slugify(k.kw);
  const h = hashCode(k.kw);
  const history = getKeywordHistory(k.kw, k.rank, k.change);
  const summary = summarizeRange(history, 30);

  const freq = FREQ_CYCLE[h % FREQ_CYCLE.length];
  const favorite = h % 5 === 0 || k.kw === "kalori sayacı";
  const updatedMinutesAgo = (() => {
    const buckets = [12, 45, 60 * 3, 60 * 24, 60 * 24 * 3, 60 * 24 * 10];
    return buckets[h % buckets.length];
  })();

  const titleCompetition: TitleCompetition =
    k.difficulty >= 70 ? "Yüksek" : k.difficulty >= 45 ? "Orta" : "Düşük";

  return {
    ...k,
    id,
    favorite,
    trackingFrequency: freq,
    updatedMinutesAgo,
    isRefreshing: false,
    tags: TAGS_POOL[h % TAGS_POOL.length],
    group: GROUP_POOL[h % GROUP_POOL.length],
    bestRank: summary.bestRank ?? k.best,
    worstRank: summary.worstRank,
    sevenDayChange: summary.sevenDayDelta,
    competitorsCount: 3 + (h % 6),
    titleCompetition,
    trend30d: summary.points.map((p) => p.rank ?? summary.currentRank ?? 200),
  };
}
