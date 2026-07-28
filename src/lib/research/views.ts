/**
 * Filters, built-in views, storage for the research workspace.
 */
import type { MetadataStatus, ResearchRecord, ResearchSourceId, TrackingStatus } from "./types";

export type BuiltInViewId =
  | "all"
  | "high_opportunity"
  | "low_difficulty"
  | "high_relevance"
  | "competitors_ranked"
  | "not_tracked"
  | "not_in_metadata";

export interface BuiltInView {
  id: BuiltInViewId;
  label: string;
  test: (r: ResearchRecord) => boolean;
}

export const BUILT_IN_VIEWS: BuiltInView[] = [
  { id: "all", label: "Tüm Sonuçlar", test: () => true },
  { id: "high_opportunity", label: "Yüksek Fırsatlar", test: (r) => r.opportunity >= 70 },
  { id: "low_difficulty", label: "Düşük Zorluk", test: (r) => r.difficulty < 40 },
  { id: "high_relevance", label: "Yüksek Alaka", test: (r) => r.relevance >= 80 },
  {
    id: "competitors_ranked",
    label: "Rakiplerde Sıralananlar",
    test: (r) => r.rankingCompetitorCount > 0,
  },
  { id: "not_tracked", label: "Takipte Olmayanlar", test: (r) => r.trackingStatus !== "tracked" },
  {
    id: "not_in_metadata",
    label: "Mağaza Bilgilerinde Kullanılmayanlar",
    test: (r) => r.metadataStatus === "not_used",
  },
];

export type Level = "all" | "high" | "medium" | "low";
export type SourceFilter = "all" | ResearchSourceId;
export type TrackingFilter = "all" | TrackingStatus;
export type MetadataFilter = "all" | MetadataStatus;
export type LongTailFilter = "all" | "long" | "short";

export interface FilterOption<V extends string> {
  value: V;
  label: string;
}

export const FILTER_OPTIONS = {
  level: [
    { value: "all", label: "Tümü" },
    { value: "high", label: "Yüksek" },
    { value: "medium", label: "Orta" },
    { value: "low", label: "Düşük" },
  ] as FilterOption<Level>[],
  source: [
    { value: "all", label: "Tümü" },
    { value: "autocomplete", label: "Otomatik Tamamlama" },
    { value: "app_metadata", label: "Uygulama Mağaza Bilgileri" },
    { value: "competitor_metadata", label: "Rakip Mağaza Bilgileri" },
    { value: "reviews", label: "Yorumlar" },
    { value: "related", label: "İlgili Anahtar Kelimeler" },
    { value: "apple_ads", label: "Apple Ads" },
    { value: "manual", label: "Manuel" },
  ] as FilterOption<SourceFilter>[],
  tracking: [
    { value: "all", label: "Tümü" },
    { value: "tracked", label: "Takipte" },
    { value: "candidate", label: "Aday Listesinde" },
    { value: "none", label: "Takip Dışı" },
  ] as FilterOption<TrackingFilter>[],
  metadata: [
    { value: "all", label: "Tümü" },
    { value: "in_use", label: "Kullanılıyor" },
    { value: "candidate", label: "Aday Listesinde" },
    { value: "not_used", label: "Kullanılmıyor" },
  ] as FilterOption<MetadataFilter>[],
  longTail: [
    { value: "all", label: "Tümü" },
    { value: "short", label: "Kısa (1–2 kelime)" },
    { value: "long", label: "Uzun (3+ kelime)" },
  ] as FilterOption<LongTailFilter>[],
} as const;

export interface ResearchFilters {
  q: string;
  source: SourceFilter;
  opportunityLevel: Level;
  difficultyLevel: Level;
  relevanceLevel: Level;
  tracking: TrackingFilter;
  metadata: MetadataFilter;
  volMin: number;
  volMax: number;
  diffMin: number;
  diffMax: number;
  relMin: number;
  relMax: number;
  oppMin: number;
  oppMax: number;
  resultMin: number;
  resultMax: number;
  rankMin: number;
  rankMax: number;
  competitorMin: number;
  sourceCountMin: number;
  longTail: LongTailFilter;
  seed: string;
}

export const DEFAULT_FILTERS: ResearchFilters = {
  q: "",
  source: "all",
  opportunityLevel: "all",
  difficultyLevel: "all",
  relevanceLevel: "all",
  tracking: "all",
  metadata: "all",
  volMin: 0,
  volMax: 100,
  diffMin: 0,
  diffMax: 100,
  relMin: 0,
  relMax: 100,
  oppMin: 0,
  oppMax: 100,
  resultMin: 0,
  resultMax: 500,
  rankMin: 1,
  rankMax: 200,
  competitorMin: 0,
  sourceCountMin: 0,
  longTail: "all",
  seed: "",
};

function levelTest(v: number, l: Level) {
  if (l === "all") return true;
  if (l === "high") return v >= 70;
  if (l === "medium") return v >= 40 && v < 70;
  return v < 40;
}

export function applyFilters(records: ResearchRecord[], f: ResearchFilters): ResearchRecord[] {
  const q = f.q.trim().toLowerCase();
  return records.filter((r) => {
    if (q && !r.keyword.toLowerCase().includes(q)) return false;
    if (f.source !== "all" && !r.sources.includes(f.source)) return false;
    if (!levelTest(r.opportunity, f.opportunityLevel)) return false;
    if (!levelTest(r.difficulty, f.difficultyLevel)) return false;
    if (!levelTest(r.relevance, f.relevanceLevel)) return false;
    if (f.tracking !== "all" && r.trackingStatus !== f.tracking) return false;
    if (f.metadata !== "all" && r.metadataStatus !== f.metadata) return false;
    if (r.estimatedVolume < f.volMin || r.estimatedVolume > f.volMax) return false;
    if (r.difficulty < f.diffMin || r.difficulty > f.diffMax) return false;
    if (r.relevance < f.relMin || r.relevance > f.relMax) return false;
    if (r.opportunity < f.oppMin || r.opportunity > f.oppMax) return false;
    if (r.meaningfulResultCount < f.resultMin || r.meaningfulResultCount > f.resultMax)
      return false;
    const rank = r.currentRank ?? 999;
    if ((f.rankMin !== 1 || f.rankMax !== 200) && (rank < f.rankMin || rank > f.rankMax))
      return false;
    if (f.competitorMin > 0 && r.rankingCompetitorCount < f.competitorMin) return false;
    if (f.sourceCountMin > 0 && r.sources.length < f.sourceCountMin) return false;
    if (f.longTail === "short" && r.wordCount > 2) return false;
    if (f.longTail === "long" && r.wordCount < 3) return false;
    if (f.seed && r.seed !== f.seed) return false;
    return true;
  });
}

export function countAdvancedFilters(f: ResearchFilters): number {
  let n = 0;
  if (f.volMin !== 0 || f.volMax !== 100) n++;
  if (f.diffMin !== 0 || f.diffMax !== 100) n++;
  if (f.relMin !== 0 || f.relMax !== 100) n++;
  if (f.oppMin !== 0 || f.oppMax !== 100) n++;
  if (f.resultMin !== 0 || f.resultMax !== 500) n++;
  if (f.rankMin !== 1 || f.rankMax !== 200) n++;
  if (f.competitorMin > 0) n++;
  if (f.sourceCountMin > 0) n++;
  if (f.longTail !== "all") n++;
  if (f.seed) n++;
  return n;
}

/* ---------------- storage ---------------- */

const PREFIX = "sonar.research.";
const K_LISTS = PREFIX + "savedLists";
const K_HISTORY = PREFIX + "history";
const K_DENSITY = PREFIX + "density";
const K_VISIBILITY = PREFIX + "visibility";
const K_TRACK = PREFIX + "trackingOverrides";
const K_META = PREFIX + "metadataOverrides";
const K_FAV = PREFIX + "favoriteOverrides";
const K_SIZING = PREFIX + "columnSizing";
const K_ORDER = PREFIX + "columnOrder";
const K_PINNING = PREFIX + "columnPinning";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export const ResearchStorage = {
  readLists: <T>() => safeRead<T[]>(K_LISTS, []),
  writeLists: <T>(v: T[]) => safeWrite(K_LISTS, v),
  readHistory: <T>() => safeRead<T[]>(K_HISTORY, []),
  writeHistory: <T>(v: T[]) => safeWrite(K_HISTORY, v),
  readDensity: () => safeRead<"comfortable" | "standard" | "compact" | null>(K_DENSITY, null),
  writeDensity: (d: string) => safeWrite(K_DENSITY, d),
  readVisibility: () => safeRead<Record<string, boolean> | null>(K_VISIBILITY, null),
  writeVisibility: (v: Record<string, boolean>) => safeWrite(K_VISIBILITY, v),
  readTracking: () => safeRead<Record<string, TrackingStatus>>(K_TRACK, {}),
  writeTracking: (v: Record<string, TrackingStatus>) => safeWrite(K_TRACK, v),
  readMetadata: () => safeRead<Record<string, MetadataStatus>>(K_META, {}),
  writeMetadata: (v: Record<string, MetadataStatus>) => safeWrite(K_META, v),
  readFavorites: () => safeRead<Record<string, boolean>>(K_FAV, {}),
  writeFavorites: (v: Record<string, boolean>) => safeWrite(K_FAV, v),
  readSizing: () => safeRead<Record<string, number> | null>(K_SIZING, null),
  writeSizing: (v: Record<string, number>) => safeWrite(K_SIZING, v),
  readOrder: () => safeRead<string[] | null>(K_ORDER, null),
  writeOrder: (v: string[]) => safeWrite(K_ORDER, v),
  readPinning: () => safeRead<{ left?: string[]; right?: string[] } | null>(K_PINNING, null),
  writePinning: (v: { left?: string[]; right?: string[] }) => safeWrite(K_PINNING, v),
};
