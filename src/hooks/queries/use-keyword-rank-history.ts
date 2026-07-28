import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { fetchKeywordRankHistory } from "@/services/keywords/keywords.service";
import { useAnalysisScope } from "@/scope";

export function useKeywordRankHistory(
  params: { keyword: string; currentRank: number | null; change: number } | null,
) {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  return useQuery({
    queryKey: queryKeys.keywords.rankHistory(scopeKey, {
      keywordIds: params ? [params.keyword] : [],
    }),
    queryFn: ({ signal }) => fetchKeywordRankHistory(scopedRequest, params!, signal),
    enabled: isScopeReady && !!params,
    staleTime: 5 * 60_000,
  });
}
