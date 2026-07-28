/**
 * Rank-history mock. Delegates to the internal ECharts data helpers, which
 * are the "backend" for the prototype.
 */
import {
  getKeywordHistory,
  summarizeRange,
  type KeywordHistory,
} from "@/lib/sonar-charts/keyword-history";
import { getScopeVariation, shiftRank } from "@/services/scope-variation";
import type { ScopedRequest } from "@/scope/types";
import type { KeywordRankPoint, KeywordRankSeries } from "./keywords.types";

export async function fetchKeywordRankHistoryMock(
  scope: ScopedRequest,
  params: {
    keyword: string;
    currentRank: number | null;
    change: number;
  },
): Promise<KeywordRankSeries> {
  const history: KeywordHistory = getKeywordHistory(
    params.keyword,
    params.currentRank,
    params.change,
  );
  const v = getScopeVariation(scope);
  // Market projection only shifts observed ranks. Gaps (null) stay gaps and no
  // sentinel rank (0 / 200 / 201) is ever synthesized.
  const points: KeywordRankPoint[] = history.points.map((p) => {
    if (p.rank == null) return { date: p.date, rank: null };
    const shifted = shiftRank(p.rank, v);
    return { date: p.date, rank: shifted == null ? null : Math.max(1, Math.min(199, shifted)) };
  });
  return {
    keywordId: params.keyword,
    keyword: params.keyword,
    points,
  };
}

export { summarizeRange };
