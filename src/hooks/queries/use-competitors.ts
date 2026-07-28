/**
 * TanStack Query hooks for the competitor-analysis workspace.
 * Pages consume these exclusively; direct service imports from routes are
 * blocked at the ESLint layer.
 */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { useAnalysisScope } from "@/scope";
import { sameScopePlaceholder } from "./scope-gate";
import {
  fetchCompetitorCatalog,
  fetchCompetitorGaps,
  fetchCompetitorKeywordDetail,
  fetchCompetitorSummary,
  fetchCompetitorVisibility,
  fetchSelectedCompetitors,
} from "@/services/competitors/competitors.service";
import type {
  CompetitorApp,
  CompetitorFilters,
  CompetitorKeywordDetail,
  CompetitorSummary,
  CompetitorVisibilityResponse,
} from "@/services/competitors/competitors.types";
import type { SortParam } from "@/api/pagination";
import type { PaginatedResponse } from "@/api/response-types";
import type { CompetitorKeywordGapRow } from "@/services/competitors/competitors.types";

export function useCompetitorCatalog() {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  return useQuery<CompetitorApp[]>({
    queryKey: queryKeys.competitors.apps(scopeKey, "catalog"),
    queryFn: () => fetchCompetitorCatalog(scopedRequest),
    enabled: isScopeReady,
    staleTime: 5 * 60_000,
  });
}

export function useCompetitorApps() {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  return useQuery<CompetitorApp[]>({
    queryKey: queryKeys.competitors.apps(scopeKey, "selected"),
    queryFn: () => fetchSelectedCompetitors(scopedRequest),
    enabled: isScopeReady,
    staleTime: 60_000,
  });
}

export function useCompetitorSummary(competitorIds: string[]) {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  return useQuery<CompetitorSummary>({
    queryKey: queryKeys.competitors.summary(scopeKey, { competitorIds }),
    queryFn: ({ signal }) => fetchCompetitorSummary(scopedRequest, competitorIds, signal),
    enabled: isScopeReady,
    staleTime: 60_000,
  });
}

export function useCompetitorVisibilityHistory(competitorIds: string[], range: 7 | 30 | 90) {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  return useQuery<CompetitorVisibilityResponse>({
    queryKey: queryKeys.competitors.visibility(scopeKey, { competitorIds, range }),
    queryFn: ({ signal }) => fetchCompetitorVisibility(scopedRequest, competitorIds, range, signal),
    enabled: isScopeReady,
    staleTime: 60_000,
    placeholderData: sameScopePlaceholder<CompetitorVisibilityResponse>(scopeKey),
  });
}

export interface CompetitorGapsParams {
  page: number;
  pageSize: number;
  search?: string;
  sorting?: SortParam[];
  filters?: CompetitorFilters;
  competitorIds: string[];
}

export function useCompetitorKeywordGaps(params: CompetitorGapsParams) {
  const { page, pageSize, search, sorting, filters, competitorIds } = params;
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  return useQuery<PaginatedResponse<CompetitorKeywordGapRow>>({
    queryKey: queryKeys.competitors.gaps(scopeKey, {
      page,
      pageSize,
      search,
      sorting,
      filters,
      competitorIds,
    }),
    queryFn: ({ signal }) =>
      fetchCompetitorGaps(
        { page, pageSize, search, sorting, filters, competitorIds, ...scopedRequest },
        signal,
      ),
    enabled: isScopeReady,
    staleTime: 30_000,
    placeholderData: sameScopePlaceholder<PaginatedResponse<CompetitorKeywordGapRow>>(scopeKey),
  });
}

export function useCompetitorKeywordDetail(rowId: string | null, competitorIds: string[]) {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  return useQuery<CompetitorKeywordDetail | null>({
    queryKey: queryKeys.competitors.detail(scopeKey, rowId ?? "__none__", competitorIds),
    queryFn: ({ signal }) =>
      fetchCompetitorKeywordDetail(scopedRequest, rowId!, competitorIds, signal),
    enabled: isScopeReady && !!rowId,
    staleTime: 30_000,
  });
}

/* Types & helper constants re-exported so pages don't need to reach into
 * `@/services/competitors` directly (ESLint blocks that). */
export type {
  CompetitorApp,
  CompetitorFilters,
  CompetitorKeywordGapRow,
  CompetitorSummary,
  CompetitorVisibilityResponse,
  GapClassification,
} from "@/services/competitors/competitors.types";
export { GAP_TO_STATUS, GAP_CLASSIFICATION_LABEL } from "@/services/competitors/competitors.types";
