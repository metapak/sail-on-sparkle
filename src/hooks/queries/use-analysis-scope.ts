/**
 * Canonical consumer entry point for the global analysis scope.
 *
 * Feature pages and hooks import from here (or `@/scope`) — the scope is never
 * re-derived, duplicated in local state, or passed down through props.
 */
export {
  useAnalysisScope,
  useScopeIdentityEffect,
  useScopeChangeEffect,
  type AnalysisScopeApi,
} from "@/scope";
export type { AnalysisScope, ScopedRequest, StoreId, AnalysisDateRange } from "@/scope";
