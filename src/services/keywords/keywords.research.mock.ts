/**
 * Mock research backend. Wraps `@/lib/research/data` (curated seed packs) +
 * `ResearchStorage` (localStorage persistence for saved lists, history,
 * favorite/metadata overrides). Tracking status is read from the unified
 * `trackedRepo` — research results and tracked-keyword rows share a single
 * source of truth for "is this keyword tracked".
 */
import {
  buildResearchResults,
  buildForApp,
  buildForCompetitors,
  buildForCategory,
  RESEARCH_SOURCES,
  DEFAULT_SOURCES,
  SOURCE_MAP,
} from "@/lib/research/data";
import { ResearchStorage, applyFilters, BUILT_IN_VIEWS } from "@/lib/research/views";
import { getScopeVariation, scaleScore, scaleVolume, shiftRank } from "@/services/scope-variation";
import type { ResearchFilters, BuiltInViewId } from "@/lib/research/views";
import type { ResearchRecord } from "@/lib/research/types";
import { paginate } from "@/api/response-types";
import { sortRows, type SortAccessorMap } from "@/api/sorting";
import type { PaginatedResponse } from "@/api/response-types";
import { trackedRepo } from "./tracked-repo.mock";
import type {
  KeywordResearchListRequest,
  KeywordResearchRequest,
  KeywordResearchRow,
  MetadataStatus,
  ResearchHistoryEntry,
  ResearchSourceId,
  ResearchSourceInfo,
  SavedResearchList,
  TrackingStatus,
} from "./keywords.types";

/* ------------- source catalog ------------- */

export function getResearchSourcesMock(): ResearchSourceInfo[] {
  return RESEARCH_SOURCES as unknown as ResearchSourceInfo[];
}
export function getDefaultResearchSourcesMock(): ResearchSourceId[] {
  return DEFAULT_SOURCES as unknown as ResearchSourceId[];
}
export function getResearchSourceMapMock(): Record<ResearchSourceId, ResearchSourceInfo> {
  return SOURCE_MAP as unknown as Record<ResearchSourceId, ResearchSourceInfo>;
}

/* ------------- search ------------- */

function deriveTrackingStatus(id: string, baseline: TrackingStatus): TrackingStatus {
  if (trackedRepo.isTracked(id, baseline === "tracked")) return "tracked";
  if (trackedRepo.isCandidate(id)) return "candidate";
  // If baseline said tracked but repo overrode to false, respect the repo.
  if (baseline === "tracked") return "none";
  return baseline === "candidate" ? "none" : baseline;
}

export async function fetchKeywordResearchMock(
  req: KeywordResearchRequest,
  _signal?: AbortSignal,
): Promise<KeywordResearchRow[]> {
  let out: KeywordResearchRow[] = [];
  if (req.method === "keyword")
    out = buildResearchResults(req.seeds, req.sources) as unknown as KeywordResearchRow[];
  else if (req.method === "app") out = buildForApp(req.sources) as unknown as KeywordResearchRow[];
  else if (req.method === "competitor")
    out = buildForCompetitors(req.sources) as unknown as KeywordResearchRow[];
  else if (req.method === "category")
    out = buildForCategory(req.sources) as unknown as KeywordResearchRow[];

  // Project the candidate set onto the requested market scope.
  const v = getScopeVariation(req);

  // Apply persisted overrides.
  const favorites = ResearchStorage.readFavorites();
  const metadata = ResearchStorage.readMetadata();
  return out.map((r) => ({
    ...r,
    currentRank: shiftRank(r.currentRank, v),
    estimatedVolume: scaleVolume(r.estimatedVolume, v),
    difficulty: scaleScore(r.difficulty, v.difficultyFactor),
    favoriteStatus: favorites[r.id] ?? r.favoriteStatus,
    trackingStatus: deriveTrackingStatus(r.id, r.trackingStatus),
    metadataStatus: (metadata[r.id] ?? r.metadataStatus) as MetadataStatus,
  }));
}

/**
 * Column id → sortable value. Column ids intentionally differ from field
 * names in places (`kw` renders `keyword`), so the mapping is explicit.
 */
const RESEARCH_SORT_ACCESSORS: SortAccessorMap<ResearchRecord> = {
  kw: (r) => r.keyword,
  keyword: (r) => r.keyword,
  favorite: (r) => (r.favoriteStatus ? 1 : 0),
  estimatedVolume: (r) => r.estimatedVolume,
  difficulty: (r) => r.difficulty,
  relevance: (r) => r.relevance,
  opportunity: (r) => r.opportunity,
  meaningfulResultCount: (r) => r.meaningfulResultCount,
  currentRank: (r) => r.currentRank,
  rankingCompetitorCount: (r) => r.rankingCompetitorCount,
  trackingStatus: (r) => r.trackingStatus,
  top10AppPower: (r) => r.top10AppPower,
  metadataStatus: (r) => r.metadataStatus,
  updatedMinutesAgo: (r) => r.updatedMinutesAgo,
  sourceCount: (r) => r.sources.length,
  seed: (r) => r.seed,
  wordCount: (r) => r.wordCount,
};

/* ------------- paginated search ------------- */

/**
 * Server-side-ready paginated research query. Delegates to the unpaginated
 * fetcher (which produces the full candidate set for a research context),
 * then applies search + filters + view + sort + pagination inside the
 * service boundary. The caller receives only the requested page.
 */
export async function fetchKeywordResearchPaginatedMock(
  req: KeywordResearchListRequest,
  signal?: AbortSignal,
): Promise<PaginatedResponse<KeywordResearchRow>> {
  const rows = await fetchKeywordResearchMock(req.context, signal);
  let items = rows as unknown as ResearchRecord[];

  const search = (req.search ?? "").trim().toLocaleLowerCase("tr-TR");
  if (search) {
    items = items.filter((r) => r.keyword.toLocaleLowerCase("tr-TR").includes(search));
  }

  const raw = req.filters as (ResearchFilters & { viewId?: BuiltInViewId }) | undefined;
  const viewId = (raw?.viewId ?? (req.viewId as BuiltInViewId | undefined)) as
    | BuiltInViewId
    | undefined;
  if (viewId) {
    const view = BUILT_IN_VIEWS.find((v) => v.id === viewId);
    if (view) items = items.filter(view.test);
  }
  if (raw) {
    items = applyFilters(items, { ...raw, q: "" } as ResearchFilters);
  }

  items = sortRows(items, req.sorting?.[0], RESEARCH_SORT_ACCESSORS);

  return paginate(items as unknown as KeywordResearchRow[], req.page, req.pageSize);
}

/* ------------- override mutations ------------- */

export async function setResearchFavoriteMock(id: string, value: boolean): Promise<void> {
  const next = { ...ResearchStorage.readFavorites(), [id]: value };
  ResearchStorage.writeFavorites(next);
}
export async function setResearchTrackingMock(ids: string[], value: TrackingStatus): Promise<void> {
  // Route via unified repo — tracked/none write to the SSOT, candidate is a
  // research-only overlay.
  if (value === "tracked") {
    trackedRepo.setTracked(ids, true);
    trackedRepo.setCandidate(ids, false);
  } else if (value === "none") {
    trackedRepo.setTracked(ids, false);
    trackedRepo.setCandidate(ids, false);
  } else {
    trackedRepo.setCandidate(ids, true);
  }
}
export async function setResearchMetadataMock(ids: string[], value: MetadataStatus): Promise<void> {
  const next = { ...ResearchStorage.readMetadata() };
  for (const id of ids) next[id] = value;
  ResearchStorage.writeMetadata(next);
}

/* ------------- saved lists ------------- */

export async function fetchResearchListsMock(): Promise<SavedResearchList[]> {
  return ResearchStorage.readLists<SavedResearchList>();
}
export async function createResearchListMock(
  name: string,
  keywordIds: string[],
): Promise<SavedResearchList> {
  const list: SavedResearchList = {
    id: `list-${Date.now()}`,
    name,
    keywordIds: Array.from(new Set(keywordIds)),
    createdAt: Date.now(),
  };
  ResearchStorage.writeLists([list, ...ResearchStorage.readLists<SavedResearchList>()]);
  return list;
}
export async function addToResearchListMock(
  listId: string,
  keywordIds: string[],
): Promise<SavedResearchList[]> {
  const next = ResearchStorage.readLists<SavedResearchList>().map((l) =>
    l.id === listId
      ? { ...l, keywordIds: Array.from(new Set([...l.keywordIds, ...keywordIds])) }
      : l,
  );
  ResearchStorage.writeLists(next);
  return next;
}
export async function removeFromResearchListMock(
  listId: string,
  keywordIds: string[],
): Promise<SavedResearchList[]> {
  const kill = new Set(keywordIds);
  const next = ResearchStorage.readLists<SavedResearchList>().map((l) =>
    l.id === listId ? { ...l, keywordIds: l.keywordIds.filter((k) => !kill.has(k)) } : l,
  );
  ResearchStorage.writeLists(next);
  return next;
}
export async function renameResearchListMock(
  listId: string,
  name: string,
): Promise<SavedResearchList[]> {
  const next = ResearchStorage.readLists<SavedResearchList>().map((l) =>
    l.id === listId ? { ...l, name } : l,
  );
  ResearchStorage.writeLists(next);
  return next;
}
export async function deleteResearchListMock(listId: string): Promise<SavedResearchList[]> {
  const next = ResearchStorage.readLists<SavedResearchList>().filter((l) => l.id !== listId);
  ResearchStorage.writeLists(next);
  return next;
}

/* ------------- history ------------- */

export async function fetchResearchHistoryMock(): Promise<ResearchHistoryEntry[]> {
  return ResearchStorage.readHistory<ResearchHistoryEntry>();
}
export async function pushResearchHistoryMock(
  entry: ResearchHistoryEntry,
): Promise<ResearchHistoryEntry[]> {
  const next = [entry, ...ResearchStorage.readHistory<ResearchHistoryEntry>()].slice(0, 25);
  ResearchStorage.writeHistory(next);
  return next;
}
export async function removeResearchHistoryMock(id: string): Promise<ResearchHistoryEntry[]> {
  const next = ResearchStorage.readHistory<ResearchHistoryEntry>().filter((x) => x.id !== id);
  ResearchStorage.writeHistory(next);
  return next;
}
