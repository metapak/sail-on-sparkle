/**
 * Unified mock keyword repository — the single source of truth for
 * tracked-keyword state in mock mode. Only this module touches
 * localStorage for keyword business data; every other mock service
 * (tracked-keywords mock, research mock) reads/writes through it.
 *
 * Persisted keys:
 *   sonar.kw.trackedIds.v1     — Record<id, boolean> explicit user overrides
 *   sonar.kw.state.v1          — Record<id, Partial<state>> favorite/freq/tag/group/freshness
 *   sonar.research.candidates.v1 — Record<id, boolean> research-only "aday" flag
 *
 * Legacy migration:
 *   sonar.research.trackingOverrides (Record<id, TrackingStatus>) — merged
 *   into the unified `tracked` map (and `candidates` map) on first read.
 */

import type { TrackingFrequency } from "./keywords.types";

const K_TRACKED = "sonar.kw.trackedIds.v1";
const K_STATE = "sonar.kw.state.v1";
const K_CANDIDATES = "sonar.research.candidates.v1";

const LEGACY_RESEARCH_TRACKING = "sonar.research.trackingOverrides";

export interface KeywordStateOverride {
  favorite?: boolean;
  trackingFrequency?: TrackingFrequency;
  tags?: string[];
  group?: string | null;
  updatedMinutesAgo?: number;
}

/* ------------- storage helpers ------------- */

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

/* ------------- in-memory cache (hydrated once) ------------- */

let tracked: Record<string, boolean> | null = null;
let overrides: Record<string, KeywordStateOverride> | null = null;
let candidates: Record<string, boolean> | null = null;
let hydrated = false;

function hydrate() {
  if (hydrated) return;
  hydrated = true;

  tracked = safeRead<Record<string, boolean>>(K_TRACKED, {});
  overrides = safeRead<Record<string, KeywordStateOverride>>(K_STATE, {});
  candidates = safeRead<Record<string, boolean>>(K_CANDIDATES, {});

  // Migrate legacy research tracking overrides into the unified repo.
  const legacy = safeRead<Record<string, "tracked" | "candidate" | "none"> | null>(
    LEGACY_RESEARCH_TRACKING,
    null,
  );
  if (legacy && typeof window !== "undefined") {
    let mutated = false;
    for (const [id, status] of Object.entries(legacy)) {
      if (status === "tracked" && tracked![id] !== true) {
        tracked![id] = true;
        mutated = true;
      } else if (status === "none" && tracked![id] !== false) {
        tracked![id] = false;
        mutated = true;
      } else if (status === "candidate" && candidates![id] !== true) {
        candidates![id] = true;
        mutated = true;
      }
    }
    if (mutated) {
      safeWrite(K_TRACKED, tracked!);
      safeWrite(K_CANDIDATES, candidates!);
    }
    try {
      window.localStorage.removeItem(LEGACY_RESEARCH_TRACKING);
    } catch {
      /* noop */
    }
  }
}

function persistTracked() {
  safeWrite(K_TRACKED, tracked!);
}
function persistOverrides() {
  safeWrite(K_STATE, overrides!);
}
function persistCandidates() {
  safeWrite(K_CANDIDATES, candidates!);
}

/* ------------- tracked-id SSOT ------------- */

export const trackedRepo = {
  isTracked(id: string, defaultVal = false): boolean {
    hydrate();
    return tracked![id] ?? defaultVal;
  },
  getTrackedOverrides(): Record<string, boolean> {
    hydrate();
    return { ...tracked! };
  },
  setTracked(ids: string[], value: boolean) {
    hydrate();
    for (const id of ids) tracked![id] = value;
    persistTracked();
  },
  toggleTracked(id: string, defaultVal = false) {
    hydrate();
    const next = !(tracked![id] ?? defaultVal);
    tracked![id] = next;
    persistTracked();
  },

  /* ---- per-keyword overrides (favorite, frequency, tags, group, freshness) ---- */
  getOverride(id: string): KeywordStateOverride | undefined {
    hydrate();
    return overrides![id];
  },
  getAllOverrides(): Record<string, KeywordStateOverride> {
    hydrate();
    return { ...overrides! };
  },
  patchOverride(id: string, patch: Partial<KeywordStateOverride>) {
    hydrate();
    overrides![id] = { ...(overrides![id] ?? {}), ...patch };
    persistOverrides();
  },
  patchMany(ids: string[], patch: Partial<KeywordStateOverride>) {
    hydrate();
    for (const id of ids) overrides![id] = { ...(overrides![id] ?? {}), ...patch };
    persistOverrides();
  },

  /* ---- research candidate (aday) flag ---- */
  isCandidate(id: string): boolean {
    hydrate();
    return candidates![id] === true;
  },
  setCandidate(ids: string[], value: boolean) {
    hydrate();
    for (const id of ids) {
      if (value) candidates![id] = true;
      else delete candidates![id];
    }
    persistCandidates();
  },
};
