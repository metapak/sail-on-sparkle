/**
 * Competitor-analysis public service surface. Chooses mock vs HTTP based on
 * `VITE_DATA_SOURCE`; pages/hooks import exclusively from here (via the
 * `@/hooks/queries/*` and `@/hooks/mutations/*` layers).
 */
import { IS_MOCK } from "@/api/config";
import { apiRequest } from "@/api/client";
import type { PaginatedResponse } from "@/api/response-types";
import type { ScopedRequest } from "@/scope/types";
import type {
  CompetitorApp,
  CompetitorGapRequest,
  CompetitorKeywordDetail,
  CompetitorKeywordGapRow,
  CompetitorSummary,
  CompetitorVisibilityResponse,
} from "./competitors.types";
import * as mock from "./competitors.mock";

/* ---- catalog / selection ---- */

/** Serializes the scope for GET endpoints (real backend path). */
function scopeQuery(scope: ScopedRequest) {
  return {
    applicationId: scope.applicationId,
    store: scope.store,
    countryCode: scope.countryCode,
    marketLocale: scope.marketLocale,
    dateFrom: scope.dateRange.from,
    dateTo: scope.dateRange.to,
    datePreset: scope.dateRange.preset,
  };
}

export function fetchCompetitorCatalog(scope: ScopedRequest): Promise<CompetitorApp[]> {
  if (IS_MOCK) return Promise.resolve(mock.getCatalogMock(scope));
  return apiRequest<CompetitorApp[]>("/v1/competitors/catalog", { query: scopeQuery(scope) });
}

export function fetchSelectedCompetitors(scope: ScopedRequest): Promise<CompetitorApp[]> {
  if (IS_MOCK) return Promise.resolve(mock.getSelectedAppsMock(scope));
  return apiRequest<CompetitorApp[]>("/v1/competitors/selection", { query: scopeQuery(scope) });
}

export const competitorMutations = {
  add: (id: string) =>
    IS_MOCK
      ? Promise.resolve(mock.addCompetitorMock(id))
      : apiRequest<CompetitorApp[]>("/v1/competitors/selection", {
          method: "POST",
          body: { id },
        }),
  remove: (id: string) =>
    IS_MOCK
      ? Promise.resolve(mock.removeCompetitorMock(id))
      : apiRequest<CompetitorApp[]>(`/v1/competitors/selection/${id}`, { method: "DELETE" }),
  trackKeyword: (rowId: string) =>
    IS_MOCK
      ? mock.trackCompetitorKeywordMock(rowId)
      : apiRequest<CompetitorKeywordGapRow | null>(`/v1/competitors/keywords/${rowId}/track`, {
          method: "POST",
        }),
  untrackKeyword: (rowId: string) =>
    IS_MOCK
      ? mock.untrackCompetitorKeywordMock(rowId)
      : apiRequest<CompetitorKeywordGapRow | null>(`/v1/competitors/keywords/${rowId}/untrack`, {
          method: "POST",
        }),
};

/* ---- summary / visibility ---- */

export function fetchCompetitorSummary(
  scope: ScopedRequest,
  competitorIds: string[],
  _signal?: AbortSignal,
): Promise<CompetitorSummary> {
  if (IS_MOCK) return mock.fetchCompetitorSummaryMock(scope, competitorIds);
  return apiRequest<CompetitorSummary>("/v1/competitors/summary", {
    method: "POST",
    body: { ...scope, competitorIds },
  });
}

export function fetchCompetitorVisibility(
  scope: ScopedRequest,
  competitorIds: string[],
  range: 7 | 30 | 90,
  _signal?: AbortSignal,
): Promise<CompetitorVisibilityResponse> {
  if (IS_MOCK) return mock.fetchCompetitorVisibilityMock(scope, competitorIds, range);
  return apiRequest<CompetitorVisibilityResponse>("/v1/competitors/visibility", {
    method: "POST",
    body: { ...scope, competitorIds, range },
  });
}

/* ---- gap list (server-side) ---- */

export function fetchCompetitorGaps(
  req: CompetitorGapRequest,
  signal?: AbortSignal,
): Promise<PaginatedResponse<CompetitorKeywordGapRow>> {
  if (IS_MOCK) return mock.fetchCompetitorGapsMock(req, signal);
  return apiRequest<PaginatedResponse<CompetitorKeywordGapRow>>("/v1/competitors/gaps", {
    method: "POST",
    body: req,
    signal,
  });
}

export function fetchCompetitorKeywordDetail(
  scope: ScopedRequest,
  rowId: string,
  competitorIds: string[],
  _signal?: AbortSignal,
): Promise<CompetitorKeywordDetail | null> {
  if (IS_MOCK) return mock.fetchCompetitorKeywordDetailMock(scope, rowId, competitorIds);
  return apiRequest<CompetitorKeywordDetail | null>(`/v1/competitors/keywords/${rowId}`, {
    method: "POST",
    body: { ...scope, competitorIds },
  });
}
