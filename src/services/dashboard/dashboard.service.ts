/**
 * Dashboard service — mock/api adapter selection.
 */
import { IS_MOCK } from "@/api/config";
import { apiRequest } from "@/api/client";
import type { DashboardSummary, DashboardSummaryRequest } from "./dashboard.types";
import { fetchDashboardSummaryMock } from "./dashboard.mock";

export function fetchDashboardSummary(
  req: DashboardSummaryRequest,
  signal?: AbortSignal,
): Promise<DashboardSummary> {
  if (IS_MOCK) return fetchDashboardSummaryMock(req, signal);
  return apiRequest<DashboardSummary>("/v1/dashboard/summary", {
    query: {
      applicationId: req.applicationId,
      store: req.store,
      countryCode: req.countryCode,
      marketLocale: req.marketLocale,
      dateFrom: req.dateRange.from,
      dateTo: req.dateRange.to,
      datePreset: req.dateRange.preset,
    },
    signal,
  });
}
