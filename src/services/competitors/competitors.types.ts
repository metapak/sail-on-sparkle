/**
 * Competitor-analysis domain types — stable, backend-neutral.
 * Turkish labels are preserved where they surface in the UI.
 */
import type { ListRequest } from "@/api/pagination";
import type { ScopedRequest } from "@/scope/types";
import type { OpportunityStatus } from "@/lib/dashboard-shared";

/* ------------- Applications ------------- */

export type StoreId = "app_store" | "google_play";

export interface CompetitorApp {
  id: string;
  name: string;
  developer: string;
  store: StoreId;
  country: string;
  /** Solid tailwind color class stub (e.g. "bg-[color:var(--cobalt)]"). */
  iconTone: "cobalt" | "violet" | "success" | "warning" | "danger" | "neutral";
  /** Short two-letter icon monogram. */
  monogram: string;
  /** Whether this application is the user's own (selected) app. */
  isOwn?: boolean;
}

/* ------------- Summary ------------- */

export interface CompetitorSummaryMetric {
  value: number;
  delta: string;
  trend: "up" | "down" | "neutral";
  note?: string;
  series?: number[];
}

export interface CompetitorSummary {
  trackedCompetitors: CompetitorSummaryMetric;
  sharedKeywords: CompetitorSummaryMetric;
  opportunities: CompetitorSummaryMetric;
  visibilityGap: CompetitorSummaryMetric;
}

/* ------------- Visibility history ------------- */

export interface VisibilitySeries {
  appId: string;
  appName: string;
  isOwn?: boolean;
  /** One value per day in the requested range. */
  points: { date: string; value: number }[];
}

export interface CompetitorVisibilityResponse {
  range: 7 | 30 | 90;
  series: VisibilitySeries[];
  /** ISO date strings, aligned across all series. */
  labels: string[];
  currentPeriodEnd: string;
  previousPeriodEnd: string;
}

/* ------------- Gap table ------------- */

export type GapClassification =
  | "Ortak Güçlü Kelime"
  | "Rakip Üstün"
  | "Quick Win"
  | "Growth Opportunity"
  | "Long-Term Opportunity"
  | "Too Competitive"
  | "Irrelevant";

/** Maps a gap classification to a shared OpportunityStatus tone. */
export const GAP_TO_STATUS: Record<GapClassification, OpportunityStatus> = {
  "Ortak Güçlü Kelime": "Koru",
  "Rakip Üstün": "Çok Rekabetçi",
  "Quick Win": "Hızlı Kazanım",
  "Growth Opportunity": "Büyüme Fırsatı",
  "Long-Term Opportunity": "Uzun Vadeli",
  "Too Competitive": "Çok Rekabetçi",
  Irrelevant: "İlgisiz",
};

/** Turkish display label for every raw classification key (UI never shows the key). */
export const GAP_CLASSIFICATION_LABEL: Record<GapClassification, string> = {
  "Ortak Güçlü Kelime": "Ortak Güçlü Kelime",
  "Rakip Üstün": "Rakip Üstün",
  "Quick Win": "Hızlı Kazanım",
  "Growth Opportunity": "Büyüme Fırsatı",
  "Long-Term Opportunity": "Uzun Vadeli",
  "Too Competitive": "Çok Rekabetçi",
  Irrelevant: "İlgisiz",
};

export interface CompetitorRankEntry {
  appId: string;
  rank: number | null;
}

export interface CompetitorKeywordGapRow {
  id: string;
  keyword: string;
  /** Own app rank; null → outside top 200. */
  ownRank: number | null;
  /** Best rank among the currently-selected competitors. */
  bestCompetitorRank: number | null;
  bestCompetitorAppId: string | null;
  /** Positive value = competitor advantage in ranks. */
  rankGap: number | null;
  /** Estimated demand score (0-100). NOT a raw search-volume number. */
  volumeScore: number;
  difficulty: number;
  opportunity: number;
  relevance: number;
  /** Number of selected competitors that rank inside top 200 for this kw. */
  competitorCoverage: number;
  competitorRanks: CompetitorRankEntry[];
  classification: GapClassification;
  updatedMinutesAgo: number;
  /** Reflects the unified tracked-repo state. */
  isTracked: boolean;
}

/* ------------- Detail ------------- */

export interface CompetitorKeywordDetail {
  row: CompetitorKeywordGapRow;
  serpStability: number; // 0-100
  historyOwn: { date: string; rank: number | null }[];
  historyByCompetitor: {
    appId: string;
    points: { date: string; rank: number | null }[];
  }[];
  lastRefreshedAt: string;
}

/* ------------- Requests ------------- */

export interface CompetitorFilters {
  competitorIds?: string[];
  ownRankMin?: number;
  ownRankMax?: number;
  competitorRankMin?: number;
  competitorRankMax?: number;
  volumeMin?: number;
  volumeMax?: number;
  difficultyMin?: number;
  difficultyMax?: number;
  relevanceMin?: number;
  relevanceMax?: number;
  opportunityMin?: number;
  opportunityMax?: number;
  classifications?: GapClassification[];
  updatedWithinMinutes?: number;
}

export type CompetitorGapRequest = ListRequest<CompetitorFilters> & {
  competitorIds: string[];
} & ScopedRequest;
