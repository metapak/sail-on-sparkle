import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { fetchAllTrackedKeywords } from "@/services/keywords/keywords.service";
import type { KeywordDetail, TrackedKeyword } from "@/services/keywords/keywords.types";
import { fetchKeywordRankHistoryMock } from "@/services/keywords/keywords.rank-history.mock";
import { useAnalysisScope } from "@/scope";

export function useKeywordDetail(keywordId: string | null) {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  return useQuery<KeywordDetail | null>({
    queryKey: queryKeys.keywords.detail(scopeKey, keywordId ?? ""),
    queryFn: async ({ signal }) => {
      const all = await fetchAllTrackedKeywords(scopedRequest, signal);
      const row = all.find((r: TrackedKeyword) => r.id === keywordId);
      if (!row) return null;
      const rank = await fetchKeywordRankHistoryMock(scopedRequest, {
        keyword: row.kw,
        currentRank: row.rank,
        change: row.change,
      });
      return { ...row, history: rank.points };
    },
    enabled: isScopeReady && !!keywordId,
    staleTime: 60_000,
  });
}
