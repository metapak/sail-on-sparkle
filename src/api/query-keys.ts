/**
 * Centralized TanStack Query key factory. Every hook must derive its
 * queryKey from here. Keys include every parameter that affects the returned
 * data.
 */
import type { ListRequest } from "./pagination";
import type { KeywordResearchListRequest } from "@/services/keywords/keywords.types";
import type { AnalysisScopeKey } from "@/scope/types";

/**
 * Every business-data key starts with the normalized analysis scope
 * (application, store, country, market locale, date range). Two different
 * scopes can therefore never share a cache entry, and switching scope always
 * produces a new key instead of showing stale numbers.
 */
export type { AnalysisScopeKey };

export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    summary: (scope: AnalysisScopeKey) => [...queryKeys.dashboard.all, "summary", scope] as const,
  },
  keywords: {
    all: ["keywords"] as const,
    tracked: (scope: AnalysisScopeKey, params: ListRequest) =>
      [...queryKeys.keywords.all, "tracked", scope, params] as const,
    trackedRoot: () => [...queryKeys.keywords.all, "tracked"] as const,
    research: (
      scope: AnalysisScopeKey,
      params: { method: string; seeds: string[]; sources: string[] },
    ) => [...queryKeys.keywords.all, "research", scope, params] as const,
    researchRoot: () => [...queryKeys.keywords.all, "research"] as const,
    researchPaginated: (scope: AnalysisScopeKey, params: KeywordResearchListRequest) =>
      [...queryKeys.keywords.all, "research", "page", scope, params] as const,
    researchSources: () => [...queryKeys.keywords.all, "research-sources"] as const,
    researchLists: () => [...queryKeys.keywords.all, "research-lists"] as const,
    researchHistory: () => [...queryKeys.keywords.all, "research-history"] as const,
    detail: (scope: AnalysisScopeKey, keywordId: string) =>
      [...queryKeys.keywords.all, "detail", scope, keywordId] as const,
    rankHistory: (scope: AnalysisScopeKey, params: { keywordIds: string[] }) =>
      [...queryKeys.keywords.all, "rank-history", scope, params] as const,
  },
  competitors: {
    all: ["competitors"] as const,
    apps: (scope: AnalysisScopeKey, variant: "catalog" | "selected") =>
      [...queryKeys.competitors.all, "apps", variant, scope] as const,
    summary: (scope: AnalysisScopeKey, params: { competitorIds: string[] }) =>
      [...queryKeys.competitors.all, "summary", scope, params] as const,
    visibility: (
      scope: AnalysisScopeKey,
      params: { competitorIds: string[]; range: 7 | 30 | 90 },
    ) => [...queryKeys.competitors.all, "visibility", scope, params] as const,
    gaps: (
      scope: AnalysisScopeKey,
      params: Omit<ListRequest, "filters"> & { filters?: unknown; competitorIds: string[] },
    ) => [...queryKeys.competitors.all, "gaps", scope, params] as const,

    gapsRoot: () => [...queryKeys.competitors.all, "gaps"] as const,
    detail: (scope: AnalysisScopeKey, rowId: string, competitorIds: string[]) =>
      [...queryKeys.competitors.all, "detail", scope, rowId, competitorIds] as const,
  },
} as const;
