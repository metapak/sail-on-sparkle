/**
 * Deterministic scope-driven data variation for the mock backend.
 *
 * Real backends return genuinely different rows per application / store /
 * country / market locale / date range. The mock layer must behave the same way
 * so scope regressions (stale numbers, ignored selectors) are visible in the UI.
 * Variation is a pure function of the scope, so results stay stable per scope.
 */
import type { ScopedRequest } from "@/scope/types";

export interface ScopeVariation {
  /** Stable numeric seed for the whole scope. */
  seed: number;
  /** Search-volume multiplier (market size). */
  volumeFactor: number;
  /** Difficulty/competition multiplier. */
  difficultyFactor: number;
  /** Absolute rank shift (positive = worse ranks in this market). */
  rankShift: number;
  /** Visibility/downloads multiplier (period length + market). */
  trafficFactor: number;
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const MARKET_SIZE: Record<string, number> = { TR: 1, US: 2.35, DE: 1.4, SA: 0.72, AE: 0.55 };
const STORE_SIZE: Record<string, number> = { "app-store": 1, "google-play": 1.55 };
const RANGE_SIZE: Record<string, number> = { "7d": 0.26, "30d": 1, "90d": 2.85 };

export function getScopeVariation(scope: ScopedRequest): ScopeVariation {
  const key = [
    scope.applicationId,
    scope.store,
    scope.countryCode,
    scope.marketLocale,
    scope.dateRange.preset,
    scope.dateRange.from,
    scope.dateRange.to,
  ].join("|");
  const seed = hash(key);
  const market = MARKET_SIZE[scope.countryCode] ?? 0.9;
  const store = STORE_SIZE[scope.store] ?? 1;
  const range = RANGE_SIZE[scope.dateRange.preset] ?? 1;
  const jitter = 0.92 + ((seed % 17) / 17) * 0.16;

  return {
    seed,
    volumeFactor: market * store * jitter,
    difficultyFactor: 0.85 + market * 0.14 + (store - 1) * 0.1,
    rankShift: Math.round(((seed % 9) - 4) * (market >= 1.4 ? 1.6 : 1)),
    trafficFactor: market * store * range * jitter,
  };
}

export function scaleVolume(base: number, v: ScopeVariation): number {
  return Math.max(10, Math.round((base * v.volumeFactor) / 10) * 10);
}

export function scaleScore(base: number, factor: number): number {
  return Math.max(1, Math.min(100, Math.round(base * factor)));
}

export function shiftRank(rank: number | null, v: ScopeVariation): number | null {
  if (rank === null) return null;
  return Math.max(1, Math.min(250, rank + v.rankShift));
}
