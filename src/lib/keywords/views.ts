import type { KeywordRecord } from "./types";
import type { OpportunityStatus } from "@/lib/dashboard-shared";

export type BuiltInViewId =
  | "all"
  | "tracked"
  | "high_opportunity"
  | "rising"
  | "falling"
  | "favorites"
  | "top200_missing";

export interface BuiltInView {
  id: BuiltInViewId;
  label: string;
  test: (r: KeywordRecord) => boolean;
}

export const BUILT_IN_VIEWS: BuiltInView[] = [
  { id: "all", label: "Tümü", test: () => true },
  { id: "tracked", label: "Takip Edilenler", test: (r) => r.tracked },
  { id: "high_opportunity", label: "Yüksek Fırsatlar", test: (r) => r.opportunity >= 70 },
  { id: "rising", label: "Yükselenler", test: (r) => r.change > 0 },
  { id: "falling", label: "Düşenler", test: (r) => r.change < 0 },
  { id: "favorites", label: "Favoriler", test: (r) => r.favorite },
  { id: "top200_missing", label: "Top 200 İçinde Bulunamayanlar", test: (r) => r.rank == null },
];

/* ---------------- Custom filters ----------------
 * Internal Select values are stable identifiers (e.g. "all", "rising").
 * UI labels come from FILTER_OPTIONS below; never render raw internal values.
 */
export type Movement = "all" | "rising" | "falling" | "stable";
export type OppFilter = "all" | OpportunityStatus;
export type OppLevel = "all" | "high" | "medium" | "low";
export type TrackedFilter = "all" | "tracked" | "untracked";
export type FavoriteFilter = "all" | "favorites" | "non_favorites";
export type FreshnessFilter = "all" | "today" | "week" | "stale";

export interface FilterOption<V extends string> {
  value: V;
  label: string;
}

export const FILTER_OPTIONS = {
  opp: [
    { value: "all", label: "Tümü" },
    { value: "Koru", label: "Koru" },
    { value: "Hızlı Kazanım", label: "Hızlı Kazanım" },
    { value: "Büyüme Fırsatı", label: "Büyüme Fırsatı" },
    { value: "Uzun Vadeli", label: "Uzun Vadeli" },
    { value: "Çok Rekabetçi", label: "Çok Rekabetçi" },
  ] as FilterOption<OppFilter>[],
  movement: [
    { value: "all", label: "Tümü" },
    { value: "rising", label: "Yükselen" },
    { value: "falling", label: "Düşen" },
    { value: "stable", label: "Stabil" },
  ] as FilterOption<Movement>[],
  oppLevel: [
    { value: "all", label: "Tümü" },
    { value: "high", label: "Yüksek" },
    { value: "medium", label: "Orta" },
    { value: "low", label: "Düşük" },
  ] as FilterOption<OppLevel>[],
  tracked: [
    { value: "all", label: "Tümü" },
    { value: "tracked", label: "Takip Ediliyor" },
    { value: "untracked", label: "Takip Edilmiyor" },
  ] as FilterOption<TrackedFilter>[],
  favorite: [
    { value: "all", label: "Tümü" },
    { value: "favorites", label: "Favoriler" },
    { value: "non_favorites", label: "Favori Değil" },
  ] as FilterOption<FavoriteFilter>[],
  freshness: [
    { value: "all", label: "Tümü" },
    { value: "today", label: "Bugün" },
    { value: "week", label: "Bu Hafta" },
    { value: "stale", label: "Güncelliğini Yitirmiş" },
  ] as FilterOption<FreshnessFilter>[],
} as const;

export interface KeywordFilters {
  q: string;
  opp: OppFilter;
  movement: Movement;
  oppLevel: OppLevel;
  rankMin: number;
  rankMax: number;
  diffMin: number;
  diffMax: number;
  volMin: number;
  volMax: number;
  relMin: number;
  relMax: number;
  tracked: TrackedFilter;
  favorite: FavoriteFilter;
  freshness: FreshnessFilter;
  tag: string;
  group: string;
}

export const DEFAULT_FILTERS: KeywordFilters = {
  q: "",
  opp: "all",
  movement: "all",
  oppLevel: "all",
  rankMin: 1,
  rankMax: 200,
  diffMin: 0,
  diffMax: 100,
  volMin: 0,
  volMax: 100,
  relMin: 0,
  relMax: 100,
  tracked: "all",
  favorite: "all",
  freshness: "all",
  tag: "",
  group: "",
};

export function applyFilters(records: KeywordRecord[], f: KeywordFilters): KeywordRecord[] {
  const q = f.q.trim().toLowerCase();
  return records.filter((k) => {
    if (q && !k.kw.toLowerCase().includes(q)) return false;
    if (f.opp !== "all" && k.status !== f.opp) return false;
    const rank = k.rank ?? 999;
    if (rank < f.rankMin || rank > f.rankMax) return false;
    if (f.movement === "rising" && k.change <= 0) return false;
    if (f.movement === "falling" && k.change >= 0) return false;
    if (f.movement === "stable" && k.change !== 0) return false;
    if (f.oppLevel === "high" && k.opportunity < 70) return false;
    if (f.oppLevel === "medium" && (k.opportunity < 40 || k.opportunity >= 70)) return false;
    if (f.oppLevel === "low" && k.opportunity >= 40) return false;
    if (k.difficulty < f.diffMin || k.difficulty > f.diffMax) return false;
    if (k.volume < f.volMin || k.volume > f.volMax) return false;
    if (k.relevance < f.relMin || k.relevance > f.relMax) return false;
    if (f.tracked === "tracked" && !k.tracked) return false;
    if (f.tracked === "untracked" && k.tracked) return false;
    if (f.favorite === "favorites" && !k.favorite) return false;
    if (f.favorite === "non_favorites" && k.favorite) return false;
    if (f.freshness === "today" && k.updatedMinutesAgo >= 60 * 24) return false;
    if (f.freshness === "week" && k.updatedMinutesAgo >= 60 * 24 * 7) return false;
    if (f.freshness === "stale" && k.updatedMinutesAgo < 60 * 24 * 7) return false;
    if (f.tag && !k.tags.includes(f.tag)) return false;
    if (f.group && k.group !== f.group) return false;
    return true;
  });
}

export function countAdvancedFilters(f: KeywordFilters): number {
  let n = 0;
  if (f.rankMin !== 1 || f.rankMax !== 200) n++;
  if (f.diffMin !== 0 || f.diffMax !== 100) n++;
  if (f.volMin !== 0 || f.volMax !== 100) n++;
  if (f.relMin !== 0 || f.relMax !== 100) n++;
  if (f.tracked !== "all") n++;
  if (f.favorite !== "all") n++;
  if (f.freshness !== "all") n++;
  if (f.tag) n++;
  if (f.group) n++;
  return n;
}

/* ---------------- Saved view snapshot ---------------- */

export interface ViewSnapshot {
  viewId: BuiltInViewId | null;
  filters: KeywordFilters;
  sorting: unknown;
  visibility: Record<string, boolean>;
  density: "comfortable" | "standard" | "compact";
  pageSize: number;
}

/* ---------------- localStorage helpers ---------------- */

const STORAGE_PREFIX = "sonar.kw.";
const K_VIEWS = STORAGE_PREFIX + "savedViews";
const K_VISIBILITY = STORAGE_PREFIX + "visibility";
const K_DENSITY = STORAGE_PREFIX + "density";
const K_DEFAULT_VIEW = STORAGE_PREFIX + "defaultViewId";
const K_SIZING = STORAGE_PREFIX + "columnSizing";

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
    // localStorage may be unavailable — silently ignore in this prototype.
  }
}

export const KeywordStorage = {
  readViews: <T>() => safeRead<T[]>(K_VIEWS, []),
  writeViews: <T>(v: T[]) => safeWrite(K_VIEWS, v),
  readVisibility: () => safeRead<Record<string, boolean> | null>(K_VISIBILITY, null),
  writeVisibility: (v: Record<string, boolean>) => safeWrite(K_VISIBILITY, v),
  readDensity: () => safeRead<"comfortable" | "standard" | "compact" | null>(K_DENSITY, null),
  writeDensity: (d: string) => safeWrite(K_DENSITY, d),
  readDefaultView: () => safeRead<string | null>(K_DEFAULT_VIEW, null),
  writeDefaultView: (id: string | null) => safeWrite(K_DEFAULT_VIEW, id),
  readSizing: () => safeRead<Record<string, number> | null>(K_SIZING, null),
  writeSizing: (v: Record<string, number>) => safeWrite(K_SIZING, v),
};
