/**
 * Public keyword service surface — chooses mock or HTTP backend based on
 * `VITE_DATA_SOURCE`. Pages and hooks import exclusively from here (or the
 * matching hooks in `@/hooks/queries` / `@/hooks/mutations`).
 */
import { IS_MOCK } from "@/api/config";
import { apiRequest } from "@/api/client";
import type { PaginatedResponse } from "@/api/response-types";
import type { ScopedRequest } from "@/scope/types";
import type {
  KeywordResearchListRequest,
  KeywordResearchRequest,
  KeywordResearchRow,
  MetadataStatus,
  ResearchHistoryEntry,
  ResearchSourceId,
  ResearchSourceInfo,
  SavedResearchList,
  TrackedKeyword,
  TrackedKeywordsRequest,
  TrackingFrequency,
  TrackingStatus,
  KeywordRankSeries,
} from "./keywords.types";
import * as mock from "./keywords.mock";
import * as researchMock from "./keywords.research.mock";
import * as rankMock from "./keywords.rank-history.mock";

/* ---- tracked keywords ---- */

export function fetchTrackedKeywords(
  req: TrackedKeywordsRequest,
  signal?: AbortSignal,
): Promise<PaginatedResponse<TrackedKeyword>> {
  if (IS_MOCK) return mock.fetchTrackedKeywordsMock(req, signal);
  return apiRequest<PaginatedResponse<TrackedKeyword>>("/v1/keywords/tracked", {
    body: req,
    method: "POST",
    signal,
  });
}

export function fetchAllTrackedKeywords(
  scope: ScopedRequest,
  signal?: AbortSignal,
): Promise<TrackedKeyword[]> {
  if (IS_MOCK) return mock.fetchAllTrackedKeywordsMock(scope, signal);
  return apiRequest<TrackedKeyword[]>("/v1/keywords/tracked/all", {
    query: {
      applicationId: scope.applicationId,
      store: scope.store,
      countryCode: scope.countryCode,
      marketLocale: scope.marketLocale,
      dateFrom: scope.dateRange.from,
      dateTo: scope.dateRange.to,
      datePreset: scope.dateRange.preset,
    },
    signal,
  });
}

export const trackedMutations = {
  toggleFavorite: (id: string) =>
    IS_MOCK
      ? mock.toggleFavoriteMock(id)
      : apiRequest<TrackedKeyword[]>(`/v1/keywords/${id}/favorite`, { method: "POST" }),
  setFavorite: (ids: string[], value: boolean) =>
    IS_MOCK
      ? mock.setFavoriteMock(ids, value)
      : apiRequest<TrackedKeyword[]>("/v1/keywords/favorite", {
          method: "POST",
          body: { ids, value },
        }),
  toggleTracked: (id: string) =>
    IS_MOCK
      ? mock.toggleTrackedMock(id)
      : apiRequest<TrackedKeyword[]>(`/v1/keywords/${id}/tracked`, { method: "POST" }),
  setTracked: (ids: string[], value: boolean) =>
    IS_MOCK
      ? mock.setTrackedMock(ids, value)
      : apiRequest<TrackedKeyword[]>("/v1/keywords/tracked", {
          method: "POST",
          body: { ids, value },
        }),
  setTrackingFrequency: (id: string, freq: TrackingFrequency) =>
    IS_MOCK
      ? mock.setTrackingFrequencyMock(id, freq)
      : apiRequest<TrackedKeyword[]>(`/v1/keywords/${id}/frequency`, {
          method: "POST",
          body: { freq },
        }),
  addTagToMany: (ids: string[], tag: string) =>
    IS_MOCK
      ? mock.addTagToManyMock(ids, tag)
      : apiRequest<TrackedKeyword[]>("/v1/keywords/tags", {
          method: "POST",
          body: { ids, tag },
        }),
  setGroupForMany: (ids: string[], group: string) =>
    IS_MOCK
      ? mock.setGroupForManyMock(ids, group)
      : apiRequest<TrackedKeyword[]>("/v1/keywords/group", {
          method: "POST",
          body: { ids, group },
        }),
  refreshMany: (ids: string[]) =>
    IS_MOCK
      ? mock.refreshManyMock(ids)
      : apiRequest<TrackedKeyword[]>("/v1/keywords/refresh", {
          method: "POST",
          body: { ids },
        }),
  addKeyword: (kw: string) =>
    IS_MOCK
      ? mock.addKeywordMock(kw)
      : apiRequest<TrackedKeyword[]>("/v1/keywords", { method: "POST", body: { kw } }),
  removeMany: (ids: string[]) =>
    IS_MOCK
      ? mock.removeManyMock(ids)
      : apiRequest<TrackedKeyword[]>("/v1/keywords", { method: "DELETE", body: { ids } }),
};

/* ---- research ---- */

export function getResearchSources(): ResearchSourceInfo[] {
  return researchMock.getResearchSourcesMock();
}
export function getDefaultResearchSources(): ResearchSourceId[] {
  return researchMock.getDefaultResearchSourcesMock();
}
export function getResearchSourceMap(): Record<ResearchSourceId, ResearchSourceInfo> {
  return researchMock.getResearchSourceMapMock();
}

export function fetchKeywordResearch(
  req: KeywordResearchRequest,
  signal?: AbortSignal,
): Promise<KeywordResearchRow[]> {
  if (IS_MOCK) return researchMock.fetchKeywordResearchMock(req, signal);
  return apiRequest<KeywordResearchRow[]>("/v1/keywords/research", {
    method: "POST",
    body: req,
    signal,
  });
}

/**
 * Server-side-ready paginated research fetch — returns only the requested
 * page along with total/totalPages metadata.
 */
export function fetchKeywordResearchPaginated(
  req: KeywordResearchListRequest,
  signal?: AbortSignal,
): Promise<PaginatedResponse<KeywordResearchRow>> {
  if (IS_MOCK) return researchMock.fetchKeywordResearchPaginatedMock(req, signal);
  return apiRequest<PaginatedResponse<KeywordResearchRow>>("/v1/keywords/research/page", {
    method: "POST",
    body: req,
    signal,
  });
}

export const researchMutations = {
  setFavorite: (id: string, value: boolean) =>
    IS_MOCK
      ? researchMock.setResearchFavoriteMock(id, value)
      : apiRequest<void>(`/v1/research/${id}/favorite`, { method: "POST", body: { value } }),
  setTracking: (ids: string[], value: TrackingStatus) =>
    IS_MOCK
      ? researchMock.setResearchTrackingMock(ids, value)
      : apiRequest<void>("/v1/research/tracking", { method: "POST", body: { ids, value } }),
  setMetadata: (ids: string[], value: MetadataStatus) =>
    IS_MOCK
      ? researchMock.setResearchMetadataMock(ids, value)
      : apiRequest<void>("/v1/research/metadata", { method: "POST", body: { ids, value } }),
};

export const researchLists = {
  list: () =>
    IS_MOCK
      ? researchMock.fetchResearchListsMock()
      : apiRequest<SavedResearchList[]>("/v1/research/lists"),
  create: (name: string, keywordIds: string[]) =>
    IS_MOCK
      ? researchMock.createResearchListMock(name, keywordIds)
      : apiRequest<SavedResearchList>("/v1/research/lists", {
          method: "POST",
          body: { name, keywordIds },
        }),
  add: (listId: string, keywordIds: string[]) =>
    IS_MOCK
      ? researchMock.addToResearchListMock(listId, keywordIds)
      : apiRequest<SavedResearchList[]>(`/v1/research/lists/${listId}/add`, {
          method: "POST",
          body: { keywordIds },
        }),
  remove: (listId: string, keywordIds: string[]) =>
    IS_MOCK
      ? researchMock.removeFromResearchListMock(listId, keywordIds)
      : apiRequest<SavedResearchList[]>(`/v1/research/lists/${listId}/remove`, {
          method: "POST",
          body: { keywordIds },
        }),
  rename: (listId: string, name: string) =>
    IS_MOCK
      ? researchMock.renameResearchListMock(listId, name)
      : apiRequest<SavedResearchList[]>(`/v1/research/lists/${listId}`, {
          method: "PATCH",
          body: { name },
        }),
  del: (listId: string) =>
    IS_MOCK
      ? researchMock.deleteResearchListMock(listId)
      : apiRequest<SavedResearchList[]>(`/v1/research/lists/${listId}`, { method: "DELETE" }),
};

export const researchHistory = {
  list: () =>
    IS_MOCK
      ? researchMock.fetchResearchHistoryMock()
      : apiRequest<ResearchHistoryEntry[]>("/v1/research/history"),
  push: (entry: ResearchHistoryEntry) =>
    IS_MOCK
      ? researchMock.pushResearchHistoryMock(entry)
      : apiRequest<ResearchHistoryEntry[]>("/v1/research/history", {
          method: "POST",
          body: entry,
        }),
  remove: (id: string) =>
    IS_MOCK
      ? researchMock.removeResearchHistoryMock(id)
      : apiRequest<ResearchHistoryEntry[]>(`/v1/research/history/${id}`, { method: "DELETE" }),
};

/* ---- rank history ---- */

export function fetchKeywordRankHistory(
  scope: ScopedRequest,
  params: { keyword: string; currentRank: number | null; change: number },
  _signal?: AbortSignal,
): Promise<KeywordRankSeries> {
  if (IS_MOCK) return rankMock.fetchKeywordRankHistoryMock(scope, params);
  return apiRequest<KeywordRankSeries>("/v1/keywords/rank-history", {
    query: {
      keyword: params.keyword,
      applicationId: scope.applicationId,
      store: scope.store,
      countryCode: scope.countryCode,
      marketLocale: scope.marketLocale,
      dateFrom: scope.dateRange.from,
      dateTo: scope.dateRange.to,
      datePreset: scope.dateRange.preset,
    },
  });
}
