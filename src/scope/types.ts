/**
 * Global analysis-scope domain model.
 *
 * One authoritative scope describes *which* business data every analytical
 * surface (table, chart, drawer, comparison, export) is looking at:
 * application + store + country + market locale + date range.
 *
 * `marketLocale` is the language used for store/keyword analysis inside the
 * selected country. It is NEVER the interface locale (see `@/i18n`), and it is
 * always derived from the country through the central market registry.
 */

export type StoreId = "app-store" | "google-play";

export type DateRangePreset = "7d" | "30d" | "90d" | "custom";

export interface AnalysisDateRange {
  preset: DateRangePreset;
  /** Inclusive ISO date (YYYY-MM-DD). */
  from: string;
  /** Inclusive ISO date (YYYY-MM-DD). */
  to: string;
}

export interface AnalysisScope {
  applicationId: string;
  store: StoreId;
  /** ISO 3166-1 alpha-2, uppercase. */
  countryCode: string;
  /** ISO 639-1 market-analysis language, lowercase. Derived from country. */
  marketLocale: string;
  dateRange: AnalysisDateRange;
}

/** Normalized primitive query-key representation of a scope. */
export type AnalysisScopeKey = readonly [
  applicationId: string,
  store: StoreId,
  countryCode: string,
  marketLocale: string,
  dateRangeKey: string,
];

/** Identity part of the scope (everything except the temporal range). */
export type AnalysisScopeIdentityKey = readonly [
  applicationId: string,
  store: StoreId,
  countryCode: string,
  marketLocale: string,
];

/**
 * Explicit, serializable request contract. Services receive this — they never
 * read React context, storage or globals.
 */
export interface ScopedRequest {
  applicationId: string;
  store: StoreId;
  countryCode: string;
  marketLocale: string;
  dateRange: AnalysisDateRange;
}

/** URL representation. Only normalized IDs — never translated labels. */
export interface AnalysisScopeSearch {
  app?: string;
  store?: string;
  country?: string;
  range?: string;
  from?: string;
  to?: string;
}

export type AnalysisScopePatch = {
  applicationId?: string;
  store?: StoreId;
  countryCode?: string;
  dateRange?: Partial<AnalysisDateRange>;
};
