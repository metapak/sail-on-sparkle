/**
 * Research (keyword discovery) — types.
 * Kept intentionally separate from the tracked-keyword domain.
 */

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
  /** Whether this source is available in the prototype (Apple Ads requires connection). */
  available: boolean;
  defaultOn: boolean;
}

export type TrackingStatus = "tracked" | "candidate" | "none";
export type MetadataStatus = "in_use" | "candidate" | "not_used";

export interface ResearchRecord {
  id: string;
  keyword: string;
  normalizedKeyword: string;
  seed: string;
  sources: ResearchSourceId[];

  /** 0–100 relative demand score. Not a monthly search volume. */
  estimatedVolume: number;
  /** 0–100 keyword competition score. */
  difficulty: number;
  /** 0–100 app–keyword relevance. */
  relevance: number;
  /** 0–100 opportunity score (composite). */
  opportunity: number;

  /** Meaningful result depth (integer). */
  meaningfulResultCount: number;
  /** 0–100 average power of Top 10 apps. */
  top10AppPower: number;
  /** Current rank of the active app for this keyword. null = Top 200 dışı. */
  currentRank: number | null;
  /** How many of the selected competitors rank in the tracked range. */
  rankingCompetitorCount: number;

  trackingStatus: TrackingStatus;
  favoriteStatus: boolean;
  metadataStatus: MetadataStatus;

  /** Length in characters + word count. */
  charLength: number;
  wordCount: number;

  /** Locale updated timestamp (minutes ago in prototype). */
  updatedMinutesAgo: number;
}

export interface ResearchQueryContext {
  method: ResearchMethod;
  seeds: string[];
  sources: ResearchSourceId[];
  app: string;
  store: string;
  country: string;
  language: string;
}

export interface ResearchHistoryEntry {
  id: string;
  context: ResearchQueryContext;
  resultCount: number;
  timestamp: number;
}

export interface SavedResearchList {
  id: string;
  name: string;
  keywordIds: string[];
  createdAt: number;
}
