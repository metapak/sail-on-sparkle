import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import {
  fetchAllTrackedKeywords,
  fetchTrackedKeywords,
} from "@/services/keywords/keywords.service";
import { getTrackedKeywordsSnapshot } from "@/services/keywords/keywords.mock";
import { IS_MOCK } from "@/api/config";
import { useAnalysisScope } from "@/scope";
import { DEFAULT_APPLICATION, DEFAULT_MARKET, DEFAULT_STORE } from "@/scope/markets";
import { sameScopePlaceholder } from "./scope-gate";
import type { TrackedKeyword, TrackedKeywordsRequest } from "@/services/keywords/keywords.types";
import type { ListRequest } from "@/api/pagination";
import type { PaginatedResponse } from "@/api/response-types";

export type { TrackedKeywordsRequest };

/**
 * Returns the complete tracked-keyword snapshot. Kept for aggregation UI
 * (summary cards, view-chip counts). Table pages must use
 * `useTrackedKeywordsPaginated` for row data.
 */
export function useTrackedKeywordsAll() {
  const { scope, scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  // The mock snapshot represents the default market only.
  const isDefaultScope =
    scope.applicationId === DEFAULT_APPLICATION.id &&
    scope.store === DEFAULT_STORE &&
    scope.countryCode === DEFAULT_MARKET.countryCode;
  return useQuery<TrackedKeyword[]>({
    // Aggregations are scope-bound too — never share one cache entry.
    queryKey: [...queryKeys.keywords.trackedRoot(), "all", scopeKey],
    queryFn: ({ signal }) => fetchAllTrackedKeywords(scopedRequest, signal),
    enabled: isScopeReady,
    staleTime: 60_000,
    // The mock snapshot represents the DEFAULT scope only. For any other scope
    // it is used as a non-authoritative placeholder that is immediately stale,
    // so the first ready render still issues its own scoped request.
    initialData: IS_MOCK && isDefaultScope ? getTrackedKeywordsSnapshot() : undefined,
    placeholderData: IS_MOCK && !isDefaultScope ? getTrackedKeywordsSnapshot() : undefined,
  });
}

/**
 * Server-side-ready paginated tracked-keyword query. The mock service
 * applies search/filter/view/sort/pagination inside its boundary and
 * returns only the requested page. Use `placeholderData: keepPreviousData`
 * so the previous page stays visible during a refetch (no table flicker).
 */
export function useTrackedKeywordsPaginated(request: ListRequest) {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  const scoped: TrackedKeywordsRequest = { ...request, ...scopedRequest };
  return useQuery<PaginatedResponse<TrackedKeyword>>({
    queryKey: queryKeys.keywords.tracked(scopeKey, request),
    queryFn: ({ signal }) => fetchTrackedKeywords(scoped, signal),
    enabled: isScopeReady,
    staleTime: 60_000,
    placeholderData: sameScopePlaceholder<PaginatedResponse<TrackedKeyword>>(scopeKey),
  });
}
