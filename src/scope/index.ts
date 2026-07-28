/**
 * Public analysis-scope API. Features (routes, hooks, shared components) must
 * import ONLY from here — never from the internal modules.
 *
 * Usage in any analytical page:
 *   const { scope, scopeKey, scopedRequest } = useAnalysisScope();
 *
 * Usage in a query hook:
 *   const { scopeKey, scopedRequest } = useAnalysisScope();
 *   useQuery({ queryKey: queryKeys.x.y(scopeKey, request), queryFn: () => svc({ ...scopedRequest, ...request }) })
 *
 * Usage for stale-state cleanup on a scope switch:
 *   useScopeIdentityEffect(() => { resetPagination(); clearSelection(); closeOverlays(); });
 */
export type {
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

export {
  AnalysisScopeProvider,
  useAnalysisScope,
  useScopeIdentityEffect,
  useScopeChangeEffect,
  type AnalysisScopeApi,
} from "./provider";

export {
  ANALYSIS_APPLICATIONS,
  ANALYSIS_MARKETS,
  ANALYSIS_MARKET_LIST,
  STORE_IDS,
  STORE_LABEL,
  getApplication,
  getMarket,
  resolveMarketLocale,
  type AnalysisApplication,
  type AnalysisMarket,
} from "./markets";

export {
  applyScopePatch,
  dateRangeForPreset,
  dateRangeKey,
  defaultScope,
  normalizeDateRange,
  parseScopeSearch,
  resolveScope,
  scopeIdentityKey,
  scopeKey,
  scopeKeyIdentity,
  toScopeSearch,
  toScopedRequest,
  type ScopeInput,
} from "./resolver";

export const DATE_RANGE_PRESET_LABEL: Record<"7d" | "30d" | "90d" | "custom", string> = {
  "7d": "Son 7 gün",
  "30d": "Son 30 gün",
  "90d": "Son 90 gün",
  custom: "Özel aralık",
};
