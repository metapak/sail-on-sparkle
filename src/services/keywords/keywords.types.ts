/**
 * Keyword domain types — stable, backend-neutral. Presentation-specific
 * fields keep their Turkish labels where they surface in the UI.
 */
import type { ListRequest } from "@/api/pagination";
import type { ScopedRequest } from "@/scope/types";

export type TrackingFrequency = "Günlük" | "3 Günde Bir" | "Haftalık" | "Aylık" | "İsteğe Bağlı";

export type TitleCompetition = "Yüksek" | "Orta" | "Düşük";

export type KeywordActionLabel =
  | "İncele"
  | "İçeriğe Ekle"
  | "Koru"
  | "Optimize Et"
  | "Sıra Kaybını İncele"
  | "Takip Et"
  | "Düşük Öncelik"
  | "İzle";

export type KeywordOpportunityStatus =
  | "Koru"
  | "Hızlı Kazanım"
  | "Büyüme Fırsatı"
  | "Uzun Vadeli"
  | "Çok Rekabetçi";

/**
 * Extended tracked-keyword row shape rendered by the tracking grid.
 * Kept structurally compatible with the internal `KeywordRecord`
 * so pages consume it directly through the service adapter.
 */
export interface TrackedKeyword {
  id: string;
  kw: string;
  rank: number | null;
  best: number;
  change: number;
  volume: number;
  difficulty: number;
  relevance: number;
  opportunity: number;
  status: KeywordOpportunityStatus;
  action: KeywordActionLabel;
  appStrength: number;
  tracked: boolean;

  favorite: boolean;
  trackingFrequency: TrackingFrequency;
  updatedMinutesAgo: number;
  isRefreshing: boolean;
  tags: string[];
  group: string | null;
  bestRank: number | null;
  worstRank: number | null;
  sevenDayChange: number | null;
  competitorsCount: number;
  titleCompetition: TitleCompetition;
  trend30d: number[];
}

/* ---------- Requests ---------- */

export type TrackedKeywordsRequest = ListRequest & ScopedRequest;

/* ---------- Research ---------- */

export type ResearchMethod = "keyword" | "app" | "competitor" | "category";

export type ResearchSourceId =
  | "autocomplete"
  | "app_metadata"
  | "competitor_metadata"
  | "reviews"
  | "related"
  | "apple_ads"
  | "manual";

export interface ResearchSourceInfo {
  id: ResearchSourceId;
  label: string;
  short: string;
  description: string;
  available: boolean;
  defaultOn: boolean;
}

export type TrackingStatus = "tracked" | "candidate" | "none";
export type MetadataStatus = "in_use" | "candidate" | "not_used";

export interface KeywordResearchRow {
  id: string;
  keyword: string;
  normalizedKeyword: string;
  seed: string;
  sources: ResearchSourceId[];
  estimatedVolume: number;
  difficulty: number;
  relevance: number;
  opportunity: number;
  meaningfulResultCount: number;
  top10AppPower: number;
  currentRank: number | null;
  rankingCompetitorCount: number;
  trackingStatus: TrackingStatus;
  favoriteStatus: boolean;
  metadataStatus: MetadataStatus;
  charLength: number;
  wordCount: number;
  updatedMinutesAgo: number;
}

/**
 * Research context = research intent (method/seeds/sources) + the explicit
 * analysis scope. Scope fields are never read from context inside services.
 */
export interface ResearchIntent {
  method: ResearchMethod;
  seeds: string[];
  sources: ResearchSourceId[];
}

export interface KeywordResearchRequest extends ResearchIntent, ScopedRequest {}

export interface ResearchHistoryEntry {
  id: string;
  context: KeywordResearchRequest;
  resultCount: number;
  timestamp: number;
}

/**
 * Server-side-ready paginated research request. Wraps a research context
 * (method + seeds + sources + scope) alongside standard list controls
 * (page / pageSize / search / sorting / filters / viewId). The mock and
 * real backends both compute search, filter, sort, and pagination
 * server-side and return only the requested page.
 */
export interface KeywordResearchListRequest {
  context: KeywordResearchRequest;
  page: number;
  pageSize: number;
  search?: string;
  sorting?: { id: string; desc: boolean }[];
  filters?: Record<string, unknown>;
  viewId?: string;
}

export interface SavedResearchList {
  id: string;
  name: string;
  keywordIds: string[];
  createdAt: number;
}

/* ---------- Rank history / detail ---------- */

export interface KeywordRankPoint {
  date: string;
  rank: number | null;
}

export interface KeywordRankSeries {
  keywordId: string;
  keyword: string;
  points: KeywordRankPoint[];
}

export interface KeywordDetail extends TrackedKeyword {
  history: KeywordRankPoint[];
}

/* ---------- Filters/sorting/pagination ---------- */

export interface KeywordFilters {
  search?: string;
  tags?: string[];
  status?: KeywordOpportunityStatus[];
  onlyFavorites?: boolean;
  onlyTracked?: boolean;
}

export interface KeywordSorting {
  id: string;
  desc: boolean;
}

export interface KeywordPagination {
  page: number;
  pageSize: number;
}

export interface KeywordOpportunity {
  id: string;
  keyword: string;
  status: KeywordOpportunityStatus;
  opportunity: number;
}
