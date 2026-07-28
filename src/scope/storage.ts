/**
 * Versioned, namespaced persistence for the analysis scope. This is a
 * UI/workspace preference — not business data. Only the scope provider may
 * use this module; route components must never touch storage directly.
 */
import type { AnalysisScope } from "./types";
import { resolveScope } from "./resolver";
import type { ScopeInput } from "./resolver";

const STORAGE_KEY = "sonar.analysis-scope.v1";

export function readPersistedScope(): ScopeInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AnalysisScope>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      applicationId: parsed.applicationId,
      store: parsed.store,
      countryCode: parsed.countryCode,
      dateRange: parsed.dateRange,
    };
  } catch {
    return null;
  }
}

/** Persists only fully normalized, valid scope values. */
export function writePersistedScope(scope: AnalysisScope): void {
  if (typeof window === "undefined") return;
  try {
    const normalized = resolveScope(scope);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    /* storage unavailable — scope stays in URL only */
  }
}

export function clearPersistedScope(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
