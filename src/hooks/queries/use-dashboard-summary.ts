import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { fetchDashboardSummary } from "@/services/dashboard/dashboard.service";
import { IS_MOCK } from "@/api/config";
import { useAnalysisScope } from "@/scope";
import { getDashboardSummarySnapshot } from "@/services/dashboard/dashboard.mock";
import type { DashboardSummary } from "@/services/dashboard/dashboard.types";

/** Re-exported so pages consume domain types through the hook layer. */
export type { DashboardSummary, DashboardKeyword } from "@/services/dashboard/dashboard.types";

/**
 * Dashboard summary for the CURRENT global analysis scope. The scope is read
 * from the provider here so no page can request a different one by accident.
 */
export function useDashboardSummary() {
  const { scopeKey, scopedRequest, isScopeReady } = useAnalysisScope();
  return useQuery<DashboardSummary>({
    queryKey: queryKeys.dashboard.summary(scopeKey),
    queryFn: ({ signal }) => fetchDashboardSummary(scopedRequest, signal),
    enabled: isScopeReady,
    staleTime: 60_000,
    placeholderData: IS_MOCK ? getDashboardSummarySnapshot(scopedRequest) : undefined,
  });
}

/**
 * Convenience accessor for surfaces that always have data (mock mode provides
 * placeholder data synchronously).
 */
export function useDashboardSummaryData(): DashboardSummary {
  return useDashboardSummary().data as DashboardSummary;
}
