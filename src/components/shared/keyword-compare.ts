/**
 * Shared builder for the keyword comparison chart series.
 *
 * Both keyword workspaces (Tracked, Research) compare rank trajectories with
 * identical semantics, so the series construction lives here instead of being
 * re-implemented per route. Points carry their ISO date so the comparison
 * dialog can align series and apply the 7/30/90 range filter by real dates
 * rather than by array position.
 */
import { getKeywordHistory, normalizeRankPoints } from "@/lib/sonar-charts/keyword-history";
import type { SharedComparisonChartSeries } from "./comparison";

export interface KeywordCompareSeed {
  id: string;
  label: string;
  /** Latest observed rank, or null when the keyword is outside Top 200. */
  currentRank: number | null;
  /** Recent rank change (positive = improvement) used to synthesize history. */
  change: number;
}

export function buildKeywordCompareSeries<T>(
  rows: T[],
  seedOf: (row: T) => KeywordCompareSeed,
): SharedComparisonChartSeries<T>[] {
  return rows.map((row) => {
    const seed = seedOf(row);
    // No observed rank means no rank history to plot — an empty series keeps
    // the keyword in the legend without inventing a trajectory.
    const points =
      seed.currentRank == null
        ? []
        : normalizeRankPoints(getKeywordHistory(seed.label, seed.currentRank, seed.change).points);
    return {
      id: seed.id,
      label: seed.label,
      row,
      values: points.map((p) => ({
        date: p.date,
        label: p.date.slice(5),
        value: p.rank,
      })),
    };
  });
}
