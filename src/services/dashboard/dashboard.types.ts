/**
 * Dashboard domain types. Stable, implementation-neutral shapes consumed by
 * the Overview page. `DashboardSummary` mirrors the fields currently rendered
 * by `/dashboard`; a future FastAPI response is mapped to this shape at the
 * service boundary.
 */

export type DashboardTrend = "up" | "down" | "neutral";

export interface DashboardMetric {
  value: number | string;
  delta: string;
  trend: DashboardTrend;
  note?: string;
}

export interface DashboardKeyword {
  kw: string;
  rank: number | null;
  best: number;
  change: number;
  volume: number;
  difficulty: number;
  relevance: number;
  opportunity: number;
  status: "Koru" | "Hızlı Kazanım" | "Büyüme Fırsatı" | "Uzun Vadeli" | "Çok Rekabetçi";
  action: string;
  appStrength: number;
  tracked: boolean;
}

export interface DashboardKpis {
  visibility: DashboardMetric;
  tracked: DashboardMetric;
  opportunities: DashboardMetric;
  searchDownloads: DashboardMetric;
}

export interface DashboardCompetitor {
  name: string;
  event: string;
  meta: string;
  ago: string;
  tone: "amber" | "blue" | "green";
}

export interface DashboardMarket {
  country: string;
  score: number;
  label: string;
  demand: number;
  competition: number;
  rankability: number;
}

export interface DashboardSummary {
  app: string;
  store: string;
  country: string;
  period: string;
  updatedAgo: string;

  kpis: DashboardKpis;

  visibilitySeries: number[];
  rankSeries: number[];
  downloadsSeries: number[];

  keywords: DashboardKeyword[];
  competitors: DashboardCompetitor[];
  markets: DashboardMarket[];
}

import type { ScopedRequest } from "@/scope/types";

/** Dashboard summary is always requested for one explicit analysis scope. */
export type DashboardSummaryRequest = ScopedRequest;
