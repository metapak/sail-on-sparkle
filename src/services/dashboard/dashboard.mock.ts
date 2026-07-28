/**
 * Mock dashboard backend. Every response is derived from the EXPLICIT scoped
 * request it receives — it never reads global state — so switching application,
 * store, country or date range visibly changes the numbers.
 */
import { DEMO } from "@/lib/dashboard-shared";
import { ANALYSIS_MARKETS, STORE_LABEL, getApplication } from "@/scope/markets";
import { DATE_RANGE_PRESET_LABEL } from "@/scope";
import { getScopeVariation, scaleScore, scaleVolume, shiftRank } from "@/services/scope-variation";
import type { DashboardSummary, DashboardSummaryRequest } from "./dashboard.types";

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(id);
        reject(new DOMException("aborted", "AbortError"));
      });
    }
  });
}

function scaleSeries(series: number[], factor: number, seed: number): number[] {
  return series.map((v, i) =>
    Math.round(v * factor * (0.97 + (((seed + i * 7) % 13) / 13) * 0.06)),
  );
}

/** Pure scope -> summary projection. Shared by snapshot and async fetch. */
export function getDashboardSummarySnapshot(req: DashboardSummaryRequest): DashboardSummary {
  const base = DEMO as unknown as DashboardSummary;
  const v = getScopeVariation(req);
  const app = getApplication(req.applicationId);
  const market = ANALYSIS_MARKETS[req.countryCode];

  return {
    ...base,
    app: app?.name ?? base.app,
    store: STORE_LABEL[req.store],
    country: market?.label ?? req.countryCode,
    period: DATE_RANGE_PRESET_LABEL[req.dateRange.preset],
    kpis: {
      ...base.kpis,
      visibility: {
        ...base.kpis.visibility,
        value: scaleScore(Number(base.kpis.visibility.value) || 0, v.volumeFactor),
      },
      searchDownloads: {
        ...base.kpis.searchDownloads,
        value: Math.round((Number(base.kpis.searchDownloads.value) || 0) * v.trafficFactor),
      },
    },
    visibilitySeries: scaleSeries(base.visibilitySeries, Math.min(1.6, v.volumeFactor), v.seed),
    rankSeries: base.rankSeries.map((r) => shiftRank(r, v) ?? r),
    downloadsSeries: scaleSeries(base.downloadsSeries, v.trafficFactor, v.seed),
    keywords: base.keywords.map((k) => ({
      ...k,
      rank: shiftRank(k.rank, v),
      volume: scaleVolume(k.volume, v),
      difficulty: scaleScore(k.difficulty, v.difficultyFactor),
    })),
    markets: base.markets,
  };
}

export async function fetchDashboardSummaryMock(
  req: DashboardSummaryRequest,
  signal?: AbortSignal,
): Promise<DashboardSummary> {
  await delay(0, signal);
  return getDashboardSummarySnapshot(req);
}
