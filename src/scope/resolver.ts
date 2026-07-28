/**
 * Pure analysis-scope resolver. No React, no storage, no side effects — this
 * module is independently testable and is the ONLY place where scope
 * normalization, dependent-field resolution and key serialization happens.
 */
import {
  ANALYSIS_APPLICATIONS,
  ANALYSIS_MARKET_LIST,
  DEFAULT_APPLICATION,
  DEFAULT_MARKET,
  DEFAULT_STORE,
  getApplication,
  getMarket,
  resolveMarketLocale,
} from "./markets";
import type {
  AnalysisDateRange,
  AnalysisScope,
  AnalysisScopeIdentityKey,
  AnalysisScopeKey,
  AnalysisScopePatch,
  AnalysisScopeSearch,
  DateRangePreset,
  ScopedRequest,
  StoreId,
} from "./types";

const PRESET_DAYS: Record<Exclude<DateRangePreset, "custom">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isIsoDate(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export function dateRangeForPreset(
  preset: Exclude<DateRangePreset, "custom">,
  now: Date = new Date(),
): AnalysisDateRange {
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (PRESET_DAYS[preset] - 1));
  return { preset, from: toIsoDate(from), to: toIsoDate(to) };
}

/** Normalizes any partial date-range input; rejects invalid/reversed ranges. */
export function normalizeDateRange(
  input: Partial<AnalysisDateRange> | undefined,
  now: Date = new Date(),
): AnalysisDateRange {
  const preset = input?.preset;
  if (preset === "custom") {
    const { from, to } = input ?? {};
    if (isIsoDate(from) && isIsoDate(to) && from <= to) return { preset: "custom", from, to };
    return dateRangeForPreset("30d", now);
  }
  if (preset === "7d" || preset === "30d" || preset === "90d")
    return dateRangeForPreset(preset, now);
  return dateRangeForPreset("30d", now);
}

export function dateRangeKey(range: AnalysisDateRange): string {
  return range.preset === "custom" ? `custom:${range.from}..${range.to}` : range.preset;
}

/**
 * Atomic dependent-field resolution: application → store → country →
 * market locale → date range. Always returns a fully valid scope; never an
 * intermediate invalid combination.
 */
export type ScopeInput = Partial<Omit<AnalysisScope, "dateRange">> & {
  dateRange?: Partial<AnalysisDateRange>;
};

export function resolveScope(partial: ScopeInput, now: Date = new Date()): AnalysisScope {
  const app = getApplication(partial.applicationId ?? "") ?? DEFAULT_APPLICATION;

  const requestedStore = partial.store as StoreId | undefined;
  const store: StoreId =
    requestedStore && app.supportedStores.includes(requestedStore)
      ? requestedStore
      : app.supportedStores.includes(DEFAULT_STORE)
        ? DEFAULT_STORE
        : app.supportedStores[0];

  const requestedMarket = getMarket(partial.countryCode ?? "");
  const market =
    requestedMarket && requestedMarket.supportedStores.includes(store)
      ? requestedMarket
      : (() => {
          const preferred = getMarket(app.defaultCountryCode);
          if (preferred && preferred.supportedStores.includes(store)) return preferred;
          return (
            ANALYSIS_MARKET_LIST.find((m) => m.supportedStores.includes(store)) ?? DEFAULT_MARKET
          );
        })();

  return {
    applicationId: app.id,
    store,
    countryCode: market.countryCode,
    marketLocale: resolveMarketLocale(market.countryCode),
    dateRange: normalizeDateRange(partial.dateRange, now),
  };
}

/** Applies a patch atomically through the resolver (one commit, one render). */
export function applyScopePatch(
  scope: AnalysisScope,
  patch: AnalysisScopePatch,
  now: Date = new Date(),
): AnalysisScope {
  return resolveScope(
    {
      applicationId: patch.applicationId ?? scope.applicationId,
      store: patch.store ?? scope.store,
      countryCode: patch.countryCode ?? scope.countryCode,
      dateRange: patch.dateRange ?? scope.dateRange,
    },
    now,
  );
}

export function defaultScope(now: Date = new Date()): AnalysisScope {
  return resolveScope({}, now);
}

export function scopeKey(scope: AnalysisScope): AnalysisScopeKey {
  return [
    scope.applicationId,
    scope.store,
    scope.countryCode,
    scope.marketLocale,
    dateRangeKey(scope.dateRange),
  ] as const;
}

export function scopeIdentityKey(scope: AnalysisScope): AnalysisScopeIdentityKey {
  return [scope.applicationId, scope.store, scope.countryCode, scope.marketLocale] as const;
}

/** Identity part of any normalized scope key (application/store/country/locale). */
export function scopeKeyIdentity(key: AnalysisScopeKey | readonly string[]): string {
  return key.slice(0, 4).join("|");
}

/** Scope → explicit typed service request. */
export function toScopedRequest(scope: AnalysisScope): ScopedRequest {
  return {
    applicationId: scope.applicationId,
    store: scope.store,
    countryCode: scope.countryCode,
    marketLocale: scope.marketLocale,
    dateRange: scope.dateRange,
  };
}

/* ---------------- URL <-> scope ---------------- */

export function parseScopeSearch(search: AnalysisScopeSearch | undefined): ScopeInput {
  if (!search) return {};
  const out: ScopeInput = {};
  if (search.app && getApplication(search.app)) out.applicationId = search.app;
  if (search.store === "app-store" || search.store === "google-play") out.store = search.store;
  if (search.country && getMarket(search.country)) out.countryCode = search.country.toUpperCase();
  const range = search.range;
  if (range === "7d" || range === "30d" || range === "90d") out.dateRange = { preset: range };
  else if (range === "custom")
    out.dateRange = { preset: "custom", from: search.from, to: search.to };
  return out;
}

export function toScopeSearch(scope: AnalysisScope): Required<AnalysisScopeSearch> {
  return {
    app: scope.applicationId,
    store: scope.store,
    country: scope.countryCode,
    range: scope.dateRange.preset,
    from: scope.dateRange.preset === "custom" ? scope.dateRange.from : "",
    to: scope.dateRange.preset === "custom" ? scope.dateRange.to : "",
  };
}

export function scopeSearchEquals(a: AnalysisScopeSearch, b: AnalysisScopeSearch): boolean {
  return (
    (a.app ?? "") === (b.app ?? "") &&
    (a.store ?? "") === (b.store ?? "") &&
    (a.country ?? "") === (b.country ?? "") &&
    (a.range ?? "") === (b.range ?? "") &&
    (a.from ?? "") === (b.from ?? "") &&
    (a.to ?? "") === (b.to ?? "")
  );
}

export function isValidApplicationId(id: string): boolean {
  return ANALYSIS_APPLICATIONS.some((a) => a.id === id);
}
