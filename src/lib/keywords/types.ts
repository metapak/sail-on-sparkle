import type { Keyword } from "@/lib/dashboard-shared";

export type TrackingFrequency = "Günlük" | "3 Günde Bir" | "Haftalık" | "Aylık" | "İsteğe Bağlı";

export type TitleCompetition = "Yüksek" | "Orta" | "Düşük";

/**
 * Extended keyword record consumed by the keyword tracking grid.
 * Derived once from `DEMO.keywords` — do not mutate directly; use `useKeywordStore`.
 */
export interface KeywordRecord extends Keyword {
  /** Stable ID (slug of `kw`) — used everywhere instead of array indexes. */
  id: string;
  favorite: boolean;
  trackingFrequency: TrackingFrequency;
  /** Freshness — minutes since last refresh. */
  updatedMinutesAgo: number;
  isRefreshing: boolean;
  tags: string[];
  group: string | null;
  bestRank: number | null;
  worstRank: number | null;
  sevenDayChange: number | null;
  competitorsCount: number;
  titleCompetition: TitleCompetition;
  /** Small history preview for optional 30-day trend column. */
  trend30d: number[];
}
