/**
 * Mock keyword backend. Wraps the internal `@/lib/keywords` domain library
 * (which holds the demo fixture + derivation logic) behind an async, typed
 * service surface.
 *
 * The single source of truth for tracked-keyword state (tracked flag,
 * favorite, frequency, tags, group, freshness) is the unified
 * `trackedRepo` mock repository. All read paths merge base records with
 * repo overrides so the value stays consistent across every consumer
 * (tracked-keywords grid, research grid, dashboard summary).
 */
import { deriveKeywordRecords, extendKeyword, slugify } from "@/lib/keywords/data";
import type { KeywordRecord } from "@/lib/keywords/types";
import type { Keyword } from "@/lib/dashboard-shared";
import { getScopeVariation, scaleScore, shiftRank } from "@/services/scope-variation";
import type { PaginatedResponse } from "@/api/response-types";
import { paginate } from "@/api/response-types";
import { sortRows, type SortAccessorMap } from "@/api/sorting";
import { applyFilters, BUILT_IN_VIEWS, DEFAULT_FILTERS } from "@/lib/keywords/views";
import type { KeywordFilters, BuiltInViewId } from "@/lib/keywords/views";
import type { ScopedRequest } from "@/scope/types";
import type { TrackedKeyword, TrackedKeywordsRequest, TrackingFrequency } from "./keywords.types";
import { trackedRepo } from "./tracked-repo.mock";

/* ------------- module-scoped derivation ------------- */

/**
 * Immutable base records — derived once from the demo fixture. Mutations
 * never mutate these; they update the unified `trackedRepo` and any
 * transient state (refresh flag, in-mock additions/removals).
 */
let baseRecords: KeywordRecord[] = deriveKeywordRecords();

/** Local, non-persisted state — transient refresh flag and ad-hoc records. */
const refreshingIds = new Set<string>();
const extraRecords: KeywordRecord[] = [];
const removedIds = new Set<string>();

/* ------------- helpers ------------- */

function delay(ms = 0, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(id);
        reject(new DOMException("aborted", "AbortError"));
      });
    }
  });
}

/** Merge a base record with unified repo state. Pure — safe on every call. */
function mergeWithRepo(r: KeywordRecord): KeywordRecord {
  const override = trackedRepo.getOverride(r.id);
  const tracked = trackedRepo.isTracked(r.id, r.tracked);
  const isRefreshing = refreshingIds.has(r.id);
  if (!override && tracked === r.tracked && !isRefreshing) return r;
  return {
    ...r,
    tracked,
    isRefreshing,
    favorite: override?.favorite ?? r.favorite,
    trackingFrequency: override?.trackingFrequency ?? r.trackingFrequency,
    tags: override?.tags ?? r.tags,
    group: override?.group ?? r.group,
    updatedMinutesAgo: override?.updatedMinutesAgo ?? r.updatedMinutesAgo,
  };
}

function allMerged(): KeywordRecord[] {
  const src = [...extraRecords, ...baseRecords].filter((r) => !removedIds.has(r.id));
  return src.map(mergeWithRepo);
}

function toDomain(r: KeywordRecord): TrackedKeyword {
  return r as unknown as TrackedKeyword;
}

/** Synchronous snapshot — used as `initialData` in the tracked-keywords hook. */
export function getTrackedKeywordsSnapshot(): TrackedKeyword[] {
  return allMerged().map(toDomain);
}

/**
 * Column id → sortable value for the tracked-keyword grid.
 */
const TRACKED_SORT_ACCESSORS: SortAccessorMap<KeywordRecord> = {
  kw: (r) => r.kw,
  favorite: (r) => (r.favorite ? 1 : 0),
  tracking: (r) => (r.tracked ? 1 : 0),
  rank: (r) => r.rank,
  change: (r) => r.change,
  volume: (r) => r.volume,
  difficulty: (r) => r.difficulty,
  relevance: (r) => r.relevance,
  opportunity: (r) => r.opportunity,
  appStrength: (r) => r.appStrength,
  status: (r) => r.status,
  bestRank: (r) => r.bestRank,
  worstRank: (r) => r.worstRank,
  sevenDayChange: (r) => r.sevenDayChange,
  competitorsCount: (r) => r.competitorsCount,
  titleCompetition: (r) => r.titleCompetition,
  updatedMinutesAgo: (r) => r.updatedMinutesAgo,
  trackingFrequency: (r) => r.trackingFrequency,
  group: (r) => r.group ?? "",
};

/* ------------- scope projection ------------- */

/**
 * Projects the baseline fixture onto the requested analysis scope. A real
 * backend returns different volumes/ranks per market — the mock mirrors that so
 * scope wiring bugs surface immediately in the UI.
 */
function applyScope<T extends { rank: number | null; volume: number; difficulty: number }>(
  rows: T[],
  req: ScopedRequest,
): T[] {
  const v = getScopeVariation(req);
  return rows.map((r) => ({
    ...r,
    rank: shiftRank(r.rank, v),
    // `volume` is a 0-100 demand score here (not a raw search count), so the
    // market factor is compressed into the score range instead of scaling
    // counts — otherwise scoped values escape the 0-100 filter domain.
    volume: scaleScore(r.volume, 0.72 + v.volumeFactor * 0.22),
    difficulty: scaleScore(r.difficulty, v.difficultyFactor),
  }));
}

/* ------------- list ------------- */

export async function fetchTrackedKeywordsMock(
  req: TrackedKeywordsRequest,
  signal?: AbortSignal,
): Promise<PaginatedResponse<TrackedKeyword>> {
  await delay(0, signal);
  let items = applyScope(allMerged(), req);

  // Search across keyword text.
  const search = (req.search ?? "").trim().toLocaleLowerCase("tr-TR");
  if (search) {
    items = items.filter((r) => r.kw.toLocaleLowerCase("tr-TR").includes(search));
  }

  // Structured filters (already typed against the shared `KeywordFilters` shape).
  const rawFilters = req.filters as (KeywordFilters & { viewId?: BuiltInViewId }) | undefined;
  if (rawFilters?.viewId) {
    const view = BUILT_IN_VIEWS.find((v) => v.id === rawFilters.viewId);
    if (view) items = items.filter(view.test);
  }
  if (rawFilters) {
    // `applyFilters` re-checks `q`, so clear it — search handled above.
    items = applyFilters(items, { ...DEFAULT_FILTERS, ...rawFilters, q: "" });
  }

  // Sorting — column ids map to record fields explicitly.
  items = sortRows(items, req.sorting?.[0], TRACKED_SORT_ACCESSORS);

  return paginate(items.map(toDomain), req.page, req.pageSize);
}

/**
 * Full snapshot — the tracked-keywords grid still renders every row
 * (client-side filter/sort/pagination) in the current UI. Prefer
 * `fetchTrackedKeywordsMock` for server-side-ready flows.
 */
export async function fetchAllTrackedKeywordsMock(
  scope: ScopedRequest,
  signal?: AbortSignal,
): Promise<TrackedKeyword[]> {
  await delay(0, signal);
  return applyScope(allMerged(), scope).map(toDomain);
}

/* ------------- mutations ------------- */

export async function toggleFavoriteMock(id: string): Promise<TrackedKeyword[]> {
  const current = allMerged().find((r) => r.id === id);
  trackedRepo.patchOverride(id, { favorite: !(current?.favorite ?? false) });
  return getTrackedKeywordsSnapshot();
}
export async function setFavoriteMock(ids: string[], value: boolean): Promise<TrackedKeyword[]> {
  trackedRepo.patchMany(ids, { favorite: value });
  return getTrackedKeywordsSnapshot();
}
export async function toggleTrackedMock(id: string): Promise<TrackedKeyword[]> {
  const current = allMerged().find((r) => r.id === id);
  trackedRepo.setTracked([id], !(current?.tracked ?? false));
  return getTrackedKeywordsSnapshot();
}
export async function setTrackedMock(ids: string[], value: boolean): Promise<TrackedKeyword[]> {
  trackedRepo.setTracked(ids, value);
  return getTrackedKeywordsSnapshot();
}
export async function setTrackingFrequencyMock(
  id: string,
  freq: TrackingFrequency,
): Promise<TrackedKeyword[]> {
  trackedRepo.patchOverride(id, { trackingFrequency: freq });
  return getTrackedKeywordsSnapshot();
}
export async function addTagToManyMock(ids: string[], tag: string): Promise<TrackedKeyword[]> {
  const merged = allMerged();
  const byId = new Map(merged.map((r) => [r.id, r]));
  for (const id of ids) {
    const r = byId.get(id);
    if (!r) continue;
    if (!r.tags.includes(tag)) trackedRepo.patchOverride(id, { tags: [...r.tags, tag] });
  }
  return getTrackedKeywordsSnapshot();
}
export async function setGroupForManyMock(ids: string[], group: string): Promise<TrackedKeyword[]> {
  trackedRepo.patchMany(ids, { group });
  return getTrackedKeywordsSnapshot();
}
export async function refreshManyMock(ids: string[]): Promise<TrackedKeyword[]> {
  const eligible = ids.filter((id) => !refreshingIds.has(id));
  if (eligible.length === 0) return getTrackedKeywordsSnapshot();
  eligible.forEach((id) => refreshingIds.add(id));
  await new Promise((res) => setTimeout(res, 1100));
  eligible.forEach((id) => refreshingIds.delete(id));
  trackedRepo.patchMany(eligible, { updatedMinutesAgo: 1 });
  return getTrackedKeywordsSnapshot();
}
export async function addKeywordMock(kw: string): Promise<TrackedKeyword[]> {
  const newKw: Keyword = {
    kw,
    rank: null,
    best: 200,
    change: 0,
    volume: 50,
    difficulty: 50,
    relevance: 70,
    opportunity: 55,
    status: "Uzun Vadeli",
    action: "Takip Et",
    appStrength: 60,
    tracked: true,
  };
  const rec = extendKeyword(newKw);
  extraRecords.unshift(rec);
  // Also mark tracked in repo so cross-page reads stay consistent.
  trackedRepo.setTracked([rec.id], true);
  return getTrackedKeywordsSnapshot();
}
export async function removeManyMock(ids: string[]): Promise<TrackedKeyword[]> {
  ids.forEach((id) => removedIds.add(id));
  // Reflect in unified repo — a removed keyword is no longer tracked.
  trackedRepo.setTracked(ids, false);
  // Also drop from local additions if it was one.
  for (let i = extraRecords.length - 1; i >= 0; i--) {
    if (ids.includes(extraRecords[i].id)) extraRecords.splice(i, 1);
  }
  return getTrackedKeywordsSnapshot();
}

/** Test helper — resets base records (not used at runtime). */
export function __resetTrackedKeywordsMock() {
  baseRecords = deriveKeywordRecords();
  extraRecords.length = 0;
  removedIds.clear();
  refreshingIds.clear();
}

/** Utility re-export for callers that need to construct a stable id. */
export { slugify as slugifyKeyword };
