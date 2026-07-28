import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import {
  fetchKeywordResearch,
  fetchKeywordResearchPaginated,
} from "@/services/keywords/keywords.service";
import { useAnalysisScope } from "@/scope";
import { sameScopePlaceholder } from "./scope-gate";
import type {
  KeywordResearchListRequest,
  KeywordResearchRequest,
  KeywordResearchRow,
  ResearchIntent,
} from "@/services/keywords/keywords.types";
import type { PaginatedResponse } from "@/api/response-types";

export type { KeywordResearchListRequest };

/**
 * Research results for an intent (method/seeds/sources) resolved against the
 * CURRENT global analysis scope.
 */
export function useKeywordResearch(
  intent: ResearchIntent | null,
  options: { enabled?: boolean } = {},
) {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  const enabled = isScopeReady && options.enabled !== false && !!intent;
  const request: KeywordResearchRequest | null = intent ? { ...intent, ...scopedRequest } : null;
  return useQuery<KeywordResearchRow[]>({
    queryKey: intent
      ? queryKeys.keywords.research(scopeKey, intent)
      : queryKeys.keywords.researchRoot(),
    queryFn: ({ signal }) => fetchKeywordResearch(request!, signal),
    enabled,
    staleTime: 60_000,
    placeholderData: sameScopePlaceholder<KeywordResearchRow[]>(scopeKey),
  });
}

/**
 * Server-side-ready paginated research query. The mock service applies
 * search/filter/view/sort/pagination inside its boundary and returns only
 * the requested page. `keepPreviousData` prevents table flicker on
 * page/sort/filter changes.
 */
export function useKeywordResearchPaginated(
  request: (Omit<KeywordResearchListRequest, "context"> & { context: ResearchIntent }) | null,
  options: { enabled?: boolean } = {},
) {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  const enabled = isScopeReady && options.enabled !== false && !!request;
  const scoped: KeywordResearchListRequest | null = request
    ? { ...request, context: { ...request.context, ...scopedRequest } }
    : null;
  return useQuery<PaginatedResponse<KeywordResearchRow>>({
    queryKey: request
      ? queryKeys.keywords.researchPaginated(scopeKey, scoped!)
      : queryKeys.keywords.researchRoot(),
    queryFn: ({ signal }) => fetchKeywordResearchPaginated(scoped!, signal),
    enabled,
    staleTime: 60_000,
    placeholderData: sameScopePlaceholder<PaginatedResponse<KeywordResearchRow>>(scopeKey),
  });
}
