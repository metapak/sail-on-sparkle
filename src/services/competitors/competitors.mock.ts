/**
 * Mock competitor-analysis backend. Simulates a server-side list endpoint
 * (search + filter + sort + paginate) over an in-memory catalog. Tracking a
 * competitor keyword routes through the unified tracked-keyword mock so
 * cross-page consistency (tracked grid, research grid, dashboard summary)
 * is preserved.
 */
import type { PaginatedResponse } from "@/api/response-types";
import { paginate } from "@/api/response-types";
import { trackedRepo } from "@/services/keywords/tracked-repo.mock";
import {
  getScopeVariation,
  scaleScore,
  shiftRank,
  type ScopeVariation,
} from "@/services/scope-variation";
import type { ScopedRequest } from "@/scope/types";
import { addKeywordMock, slugifyKeyword } from "@/services/keywords/keywords.mock";
import type {
  CompetitorApp,
  CompetitorGapRequest,
  CompetitorKeywordDetail,
  CompetitorKeywordGapRow,
  CompetitorRankEntry,
  CompetitorSummary,
  CompetitorVisibilityResponse,
  GapClassification,
  VisibilitySeries,
} from "./competitors.types";

/* ---------------- catalog ---------------- */

const OWN_APP: CompetitorApp = {
  id: "app.fitloop",
  name: "FitLoop — Günlük Fitness",
  developer: "FitLoop Studio",
  store: "app_store",
  country: "TR",
  iconTone: "cobalt",
  monogram: "FL",
  isOwn: true,
};

const CATALOG: CompetitorApp[] = [
  {
    id: "cmp.myfitnesspal",
    name: "MyFitnessPal",
    developer: "MyFitnessPal, Inc.",
    store: "app_store",
    country: "TR",
    iconTone: "success",
    monogram: "MF",
  },
  {
    id: "cmp.fitbit",
    name: "Fitbit",
    developer: "Fitbit LLC",
    store: "app_store",
    country: "TR",
    iconTone: "violet",
    monogram: "FB",
  },
  {
    id: "cmp.nike",
    name: "Nike Training Club",
    developer: "Nike, Inc.",
    store: "app_store",
    country: "TR",
    iconTone: "warning",
    monogram: "NT",
  },
  {
    id: "cmp.strava",
    name: "Strava",
    developer: "Strava, Inc.",
    store: "app_store",
    country: "TR",
    iconTone: "danger",
    monogram: "ST",
  },
  {
    id: "cmp.yazio",
    name: "Yazio",
    developer: "YAZIO GmbH",
    store: "app_store",
    country: "TR",
    iconTone: "cobalt",
    monogram: "YZ",
  },
  {
    id: "cmp.homeworkout",
    name: "Home Workout — No Equipment",
    developer: "Leap Fitness Group",
    store: "app_store",
    country: "TR",
    iconTone: "neutral",
    monogram: "HW",
  },
  {
    id: "cmp.freeletics",
    name: "Freeletics",
    developer: "Freeletics GmbH",
    store: "app_store",
    country: "TR",
    iconTone: "warning",
    monogram: "FR",
  },
];

/* ---------------- selection state ---------------- */

const DEFAULT_SELECTED = ["cmp.myfitnesspal", "cmp.fitbit", "cmp.nike"];
let selectedIds: string[] = [...DEFAULT_SELECTED];

/** Maps the scope store id onto the competitor-domain store id. */
function toDomainStore(scope: ScopedRequest): CompetitorApp["store"] {
  return scope.store === "google-play" ? "google_play" : "app_store";
}

/**
 * Projects a catalog entry onto the active scope. Only market-descriptive
 * fields change — ids, names, developers, tones and monograms are stable.
 */
function projectApp(app: CompetitorApp, scope: ScopedRequest): CompetitorApp {
  return { ...app, store: toDomainStore(scope), country: scope.countryCode };
}

export function getCatalogMock(scope: ScopedRequest): CompetitorApp[] {
  return [OWN_APP, ...CATALOG].map((a) => projectApp(a, scope));
}

export function getSelectedAppsMock(scope?: ScopedRequest): CompetitorApp[] {
  const comps = selectedIds
    .map((id) => CATALOG.find((c) => c.id === id))
    .filter((c): c is CompetitorApp => !!c);
  // Selection order is preserved exactly; only market fields are projected.
  const list = [OWN_APP, ...comps];
  return scope ? list.map((a) => projectApp(a, scope)) : list;
}

export function addCompetitorMock(id: string, scope?: ScopedRequest): CompetitorApp[] {
  if (!CATALOG.find((c) => c.id === id)) return getSelectedAppsMock(scope);
  if (selectedIds.includes(id)) return getSelectedAppsMock(scope);
  if (selectedIds.length >= 5) return getSelectedAppsMock(scope);
  selectedIds = [...selectedIds, id];
  return getSelectedAppsMock(scope);
}

export function removeCompetitorMock(id: string, scope?: ScopedRequest): CompetitorApp[] {
  selectedIds = selectedIds.filter((x) => x !== id);
  return getSelectedAppsMock(scope);
}

/* ---------------- keyword catalog ---------------- */

const KEYWORDS: {
  keyword: string;
  ownRank: number | null;
  volume: number;
  difficulty: number;
  relevance: number;
  ranks: Record<string, number | null>;
}[] = [
  {
    keyword: "kalori sayacı",
    ownRank: 18,
    volume: 82,
    difficulty: 74,
    relevance: 96,
    ranks: {
      "cmp.myfitnesspal": 2,
      "cmp.yazio": 6,
      "cmp.fitbit": 45,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.homeworkout": 88,
      "cmp.freeletics": 120,
    },
  },
  {
    keyword: "fitness uygulaması",
    ownRank: 24,
    volume: 88,
    difficulty: 78,
    relevance: 92,
    ranks: {
      "cmp.nike": 3,
      "cmp.freeletics": 8,
      "cmp.myfitnesspal": 12,
      "cmp.fitbit": 15,
      "cmp.homeworkout": 22,
      "cmp.yazio": 60,
      "cmp.strava": 40,
    },
  },
  {
    keyword: "adım sayar",
    ownRank: null,
    volume: 76,
    difficulty: 62,
    relevance: 70,
    ranks: {
      "cmp.fitbit": 4,
      "cmp.nike": 28,
      "cmp.strava": 12,
      "cmp.myfitnesspal": 34,
      "cmp.yazio": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "koşu takip",
    ownRank: 62,
    volume: 71,
    difficulty: 66,
    relevance: 74,
    ranks: {
      "cmp.strava": 1,
      "cmp.nike": 6,
      "cmp.fitbit": 18,
      "cmp.myfitnesspal": 55,
      "cmp.homeworkout": null,
      "cmp.yazio": null,
      "cmp.freeletics": 90,
    },
  },
  {
    keyword: "evde egzersiz",
    ownRank: 12,
    volume: 79,
    difficulty: 58,
    relevance: 88,
    ranks: {
      "cmp.homeworkout": 2,
      "cmp.nike": 4,
      "cmp.freeletics": 9,
      "cmp.myfitnesspal": 40,
      "cmp.fitbit": 60,
      "cmp.strava": null,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "kilo takibi",
    ownRank: 9,
    volume: 68,
    difficulty: 54,
    relevance: 90,
    ranks: {
      "cmp.myfitnesspal": 3,
      "cmp.yazio": 5,
      "cmp.fitbit": 22,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.homeworkout": 70,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "hiit antrenman",
    ownRank: 34,
    volume: 60,
    difficulty: 52,
    relevance: 82,
    ranks: {
      "cmp.freeletics": 3,
      "cmp.nike": 8,
      "cmp.homeworkout": 14,
      "cmp.myfitnesspal": null,
      "cmp.fitbit": null,
      "cmp.strava": null,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "yoga",
    ownRank: null,
    volume: 84,
    difficulty: 82,
    relevance: 42,
    ranks: {
      "cmp.nike": 22,
      "cmp.homeworkout": 30,
      "cmp.freeletics": 90,
      "cmp.myfitnesspal": null,
      "cmp.fitbit": null,
      "cmp.strava": null,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "bisiklet takibi",
    ownRank: null,
    volume: 54,
    difficulty: 48,
    relevance: 30,
    ranks: {
      "cmp.strava": 2,
      "cmp.fitbit": 35,
      "cmp.nike": null,
      "cmp.myfitnesspal": null,
      "cmp.yazio": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "beslenme günlüğü",
    ownRank: 21,
    volume: 62,
    difficulty: 50,
    relevance: 92,
    ranks: {
      "cmp.myfitnesspal": 1,
      "cmp.yazio": 3,
      "cmp.fitbit": 30,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "su içme takibi",
    ownRank: 8,
    volume: 46,
    difficulty: 32,
    relevance: 78,
    ranks: {
      "cmp.myfitnesspal": 12,
      "cmp.yazio": 6,
      "cmp.fitbit": 26,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "günlük egzersiz planı",
    ownRank: 40,
    volume: 66,
    difficulty: 60,
    relevance: 84,
    ranks: {
      "cmp.nike": 5,
      "cmp.freeletics": 11,
      "cmp.homeworkout": 18,
      "cmp.myfitnesspal": 70,
      "cmp.fitbit": 55,
      "cmp.strava": null,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "kardiyo",
    ownRank: 55,
    volume: 58,
    difficulty: 58,
    relevance: 74,
    ranks: {
      "cmp.nike": 6,
      "cmp.freeletics": 12,
      "cmp.fitbit": 40,
      "cmp.strava": 30,
      "cmp.myfitnesspal": null,
      "cmp.homeworkout": 45,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "protein hesaplama",
    ownRank: 15,
    volume: 44,
    difficulty: 36,
    relevance: 82,
    ranks: {
      "cmp.myfitnesspal": 2,
      "cmp.yazio": 7,
      "cmp.fitbit": null,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "vücut kitle indeksi",
    ownRank: 27,
    volume: 52,
    difficulty: 44,
    relevance: 80,
    ranks: {
      "cmp.myfitnesspal": 9,
      "cmp.yazio": 4,
      "cmp.fitbit": 20,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "spor programı",
    ownRank: 44,
    volume: 70,
    difficulty: 68,
    relevance: 86,
    ranks: {
      "cmp.nike": 4,
      "cmp.freeletics": 10,
      "cmp.homeworkout": 20,
      "cmp.myfitnesspal": 80,
      "cmp.fitbit": 90,
      "cmp.strava": null,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "kilo verme",
    ownRank: 33,
    volume: 92,
    difficulty: 88,
    relevance: 80,
    ranks: {
      "cmp.myfitnesspal": 4,
      "cmp.yazio": 10,
      "cmp.nike": 24,
      "cmp.fitbit": 30,
      "cmp.homeworkout": 40,
      "cmp.freeletics": 55,
      "cmp.strava": null,
    },
  },
  {
    keyword: "sağlıklı yaşam",
    ownRank: 66,
    volume: 74,
    difficulty: 76,
    relevance: 62,
    ranks: {
      "cmp.myfitnesspal": 8,
      "cmp.fitbit": 12,
      "cmp.yazio": 18,
      "cmp.nike": 24,
      "cmp.homeworkout": 50,
      "cmp.strava": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "günlük adım hedefi",
    ownRank: null,
    volume: 48,
    difficulty: 40,
    relevance: 66,
    ranks: {
      "cmp.fitbit": 2,
      "cmp.nike": 20,
      "cmp.strava": 15,
      "cmp.myfitnesspal": 35,
      "cmp.yazio": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "vücut ölçüleri takibi",
    ownRank: 19,
    volume: 40,
    difficulty: 30,
    relevance: 78,
    ranks: {
      "cmp.myfitnesspal": 3,
      "cmp.yazio": 6,
      "cmp.fitbit": 22,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "sabah antrenmanı",
    ownRank: 28,
    volume: 42,
    difficulty: 38,
    relevance: 76,
    ranks: {
      "cmp.nike": 5,
      "cmp.freeletics": 12,
      "cmp.homeworkout": 18,
      "cmp.myfitnesspal": null,
      "cmp.fitbit": null,
      "cmp.strava": null,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "karın kası",
    ownRank: 72,
    volume: 66,
    difficulty: 64,
    relevance: 68,
    ranks: {
      "cmp.homeworkout": 3,
      "cmp.nike": 10,
      "cmp.freeletics": 14,
      "cmp.myfitnesspal": null,
      "cmp.fitbit": null,
      "cmp.strava": null,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "makro hesaplama",
    ownRank: 11,
    volume: 38,
    difficulty: 34,
    relevance: 88,
    ranks: {
      "cmp.myfitnesspal": 2,
      "cmp.yazio": 5,
      "cmp.fitbit": null,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "uyku takibi",
    ownRank: null,
    volume: 62,
    difficulty: 56,
    relevance: 40,
    ranks: {
      "cmp.fitbit": 4,
      "cmp.myfitnesspal": 30,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.yazio": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "egzersiz videoları",
    ownRank: 50,
    volume: 58,
    difficulty: 60,
    relevance: 78,
    ranks: {
      "cmp.nike": 3,
      "cmp.homeworkout": 12,
      "cmp.freeletics": 22,
      "cmp.myfitnesspal": null,
      "cmp.fitbit": null,
      "cmp.strava": null,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "vegan diyet",
    ownRank: null,
    volume: 48,
    difficulty: 44,
    relevance: 26,
    ranks: {
      "cmp.myfitnesspal": 12,
      "cmp.yazio": 6,
      "cmp.fitbit": null,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "intermittent fasting",
    ownRank: 42,
    volume: 56,
    difficulty: 50,
    relevance: 72,
    ranks: {
      "cmp.yazio": 3,
      "cmp.myfitnesspal": 10,
      "cmp.fitbit": null,
      "cmp.nike": null,
      "cmp.strava": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "fitness planlayıcı",
    ownRank: 20,
    volume: 44,
    difficulty: 42,
    relevance: 84,
    ranks: {
      "cmp.nike": 4,
      "cmp.freeletics": 12,
      "cmp.myfitnesspal": 22,
      "cmp.fitbit": 30,
      "cmp.homeworkout": 45,
      "cmp.strava": null,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "yürüyüş takip",
    ownRank: null,
    volume: 52,
    difficulty: 44,
    relevance: 60,
    ranks: {
      "cmp.strava": 4,
      "cmp.fitbit": 10,
      "cmp.nike": 25,
      "cmp.myfitnesspal": null,
      "cmp.yazio": null,
      "cmp.homeworkout": null,
      "cmp.freeletics": null,
    },
  },
  {
    keyword: "spor günlüğü",
    ownRank: 14,
    volume: 40,
    difficulty: 32,
    relevance: 88,
    ranks: {
      "cmp.strava": 6,
      "cmp.nike": 12,
      "cmp.freeletics": 18,
      "cmp.fitbit": 22,
      "cmp.myfitnesspal": 28,
      "cmp.homeworkout": null,
      "cmp.yazio": null,
    },
  },
  {
    keyword: "kalori yakma",
    ownRank: 25,
    volume: 64,
    difficulty: 58,
    relevance: 82,
    ranks: {
      "cmp.myfitnesspal": 6,
      "cmp.nike": 10,
      "cmp.fitbit": 16,
      "cmp.freeletics": 20,
      "cmp.yazio": 22,
      "cmp.homeworkout": 34,
      "cmp.strava": null,
    },
  },
  {
    keyword: "fitness challenge",
    ownRank: 38,
    volume: 50,
    difficulty: 48,
    relevance: 76,
    ranks: {
      "cmp.nike": 4,
      "cmp.freeletics": 8,
      "cmp.homeworkout": 20,
      "cmp.myfitnesspal": null,
      "cmp.fitbit": null,
      "cmp.strava": null,
      "cmp.yazio": null,
    },
  },
];

/* ---------------- derivations ---------------- */

function classifyRow(
  ownRank: number | null,
  bestCompRank: number | null,
  volume: number,
  difficulty: number,
  relevance: number,
): GapClassification {
  if (relevance < 35) return "Irrelevant";
  if (ownRank != null && ownRank <= 10 && bestCompRank != null && bestCompRank <= 10) {
    return "Ortak Güçlü Kelime";
  }
  if (ownRank == null && bestCompRank != null && bestCompRank <= 30 && difficulty > 75) {
    return "Too Competitive";
  }
  if (
    (ownRank == null || ownRank > 50) &&
    bestCompRank != null &&
    bestCompRank <= 20 &&
    volume >= 60
  ) {
    return "Rakip Üstün";
  }
  if (ownRank != null && ownRank <= 30 && difficulty <= 55 && volume >= 55) {
    return "Quick Win";
  }
  if ((ownRank == null || ownRank > 30) && difficulty <= 60 && volume >= 45) {
    return "Growth Opportunity";
  }
  return "Long-Term Opportunity";
}

function computeOpportunity(
  ownRank: number | null,
  volume: number,
  difficulty: number,
  relevance: number,
): number {
  const rankFactor = ownRank == null ? 60 : Math.max(0, 100 - ownRank);
  return Math.round(volume * 0.4 + relevance * 0.3 + rankFactor * 0.2 + (100 - difficulty) * 0.1);
}

function stableHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function keywordId(kw: string): string {
  return slugifyKeyword(kw);
}

/**
 * Scope-shifted rank. Missing ranks stay missing and the synthetic sentinel
 * values (0 / 200 / 201) are never produced.
 */
function shiftGapRank(rank: number | null, v?: ScopeVariation): number | null {
  if (rank == null) return null;
  if (!v) return rank;
  const shifted = shiftRank(rank, v);
  if (shifted == null) return null;
  return Math.max(1, Math.min(199, shifted));
}

function buildRow(
  kw: (typeof KEYWORDS)[number],
  competitorIds: string[],
  v?: ScopeVariation,
): CompetitorKeywordGapRow {
  const ownRank = shiftGapRank(kw.ownRank, v);
  // `volume` is a 0-100 demand score, so the market factor is compressed into
  // the score domain instead of scaling raw counts.
  const volume = v ? scaleScore(kw.volume, 0.72 + v.volumeFactor * 0.22) : kw.volume;
  const difficulty = v ? scaleScore(kw.difficulty, v.difficultyFactor) : kw.difficulty;
  const relevance = kw.relevance;
  const ranks: CompetitorRankEntry[] = competitorIds.map((id) => ({
    appId: id,
    rank: shiftGapRank(kw.ranks[id] ?? null, v),
  }));
  const ranked = ranks.filter((r) => r.rank != null) as { appId: string; rank: number }[];
  const bestComp = ranked.length
    ? ranked.reduce((best, cur) => (cur.rank < best.rank ? cur : best))
    : null;
  const coverage = ranked.length;
  const opportunity = computeOpportunity(ownRank, volume, difficulty, relevance);
  const classification = classifyRow(
    ownRank,
    bestComp?.rank ?? null,
    volume,
    difficulty,
    relevance,
  );
  const id = keywordId(kw.keyword);
  const gap =
    ownRank != null && bestComp
      ? ownRank - bestComp.rank
      : ownRank == null && bestComp
        ? 200 - bestComp.rank
        : null;
  return {
    id,
    keyword: kw.keyword,
    ownRank,
    bestCompetitorRank: bestComp?.rank ?? null,
    bestCompetitorAppId: bestComp?.appId ?? null,
    rankGap: gap,
    volumeScore: volume,
    difficulty,
    opportunity,
    relevance,
    competitorCoverage: coverage,
    competitorRanks: ranks,
    classification,
    updatedMinutesAgo: (stableHash(kw.keyword) % 240) + 5,
    isTracked: trackedRepo.isTracked(id, false),
  };
}

/* ---------------- summary ---------------- */

export async function fetchCompetitorSummaryMock(
  scope: ScopedRequest,
  competitorIds: string[],
): Promise<CompetitorSummary> {
  const v = getScopeVariation(scope);
  const rows = KEYWORDS.map((k) => buildRow(k, competitorIds, v));
  const shared = rows.filter(
    (r) => r.ownRank != null && r.bestCompetitorRank != null && r.competitorCoverage > 0,
  ).length;
  const opps = rows.filter(
    (r) => r.classification === "Quick Win" || r.classification === "Growth Opportunity",
  ).length;
  const gaps = rows
    .filter((r) => r.rankGap != null)
    .map((r) => (r.ownRank ?? 200) - (r.bestCompetitorRank ?? 200));
  const avgGap = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 0;
  return {
    trackedCompetitors: {
      value: competitorIds.length,
      delta: `${DEFAULT_SELECTED.length} → ${competitorIds.length}`,
      trend:
        competitorIds.length > DEFAULT_SELECTED.length
          ? "up"
          : competitorIds.length < DEFAULT_SELECTED.length
            ? "down"
            : "neutral",
      note: "En fazla 5 rakip izlenebilir",
    },
    sharedKeywords: {
      value: shared,
      delta: `+${Math.max(0, shared - 10)} son 30 gün`,
      trend: "up",
      note: "Sizin ve rakiplerinizin top 200’de bulunduğu kelimeler",
      series: [8, 9, 10, 11, 12, 13, 14, shared],
    },
    opportunities: {
      value: opps,
      delta: `+${Math.max(0, opps - 3)} yeni fırsat`,
      trend: "up",
      note: "Hızlı Kazanım + Büyüme Fırsatı",
      series: [3, 4, 5, 5, 6, 6, 7, opps],
    },
    visibilityGap: {
      value: avgGap,
      delta: `${avgGap > 0 ? "+" : ""}${avgGap} sıra`,
      trend: avgGap > 0 ? "down" : avgGap < 0 ? "up" : "neutral",
      note: "Ortalama sıra farkı (siz − en iyi rakip)",
    },
  };
}

/* ---------------- visibility ---------------- */

function synthVisibility(seed: string, base: number, range: number): number[] {
  const out: number[] = [];
  const h = stableHash(seed);
  for (let i = 0; i < range; i++) {
    const t = i / Math.max(1, range - 1);
    const drift = Math.sin((h % 7) + i / 5) * 3;
    const wobble = (((h + i * 13) % 11) - 5) * 0.6;
    out.push(Math.max(0, Math.min(100, Math.round(base + drift + wobble + t * 4))));
  }
  return out;
}

const BASE_VISIBILITY: Record<string, number> = {
  "app.fitloop": 62,
  "cmp.myfitnesspal": 78,
  "cmp.fitbit": 70,
  "cmp.nike": 74,
  "cmp.strava": 55,
  "cmp.yazio": 60,
  "cmp.homeworkout": 58,
  "cmp.freeletics": 52,
};

function isoDate(offsetDays: number): string {
  const d = new Date("2026-07-24T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function fetchCompetitorVisibilityMock(
  scope: ScopedRequest,
  competitorIds: string[],
  range: 7 | 30 | 90,
): Promise<CompetitorVisibilityResponse> {
  const v = getScopeVariation(scope);
  const scopeSeed = `${scope.applicationId}|${scope.store}|${scope.countryCode}|${scope.marketLocale}|${scope.dateRange.preset}`;
  const ids = ["app.fitloop", ...competitorIds];
  const labels: string[] = [];
  for (let i = range - 1; i >= 0; i--) labels.push(isoDate(-i));
  const series: VisibilitySeries[] = ids.map((id) => {
    const app =
      id === "app.fitloop"
        ? OWN_APP
        : (CATALOG.find((c) => c.id === id) ?? {
            id,
            name: id,
            developer: "",
            store: "app_store" as const,
            country: "TR",
            iconTone: "neutral" as const,
            monogram: "?",
          });
    const values = synthVisibility(
      `${id}|${scopeSeed}`,
      scaleScore(BASE_VISIBILITY[id] ?? 55, 0.72 + v.volumeFactor * 0.22),
      range,
    );
    return {
      appId: id,
      appName: app.name,
      isOwn: id === "app.fitloop",
      points: labels.map((date, i) => ({ date, value: values[i] })),
    };
  });
  return {
    range,
    series,
    labels,
    currentPeriodEnd: labels[labels.length - 1],
    previousPeriodEnd: labels[0],
  };
}

/* ---------------- gap list (server-side) ---------------- */

/** Dynamic competitor rank columns are identified as `comp_<appId>`. */
const COMPETITOR_SORT_PREFIX = "comp_";

const SORT_KEYS = new Set([
  "keyword",
  "ownRank",
  "bestCompetitorRank",
  "rankGap",
  "volumeScore",
  "difficulty",
  "opportunity",
  "relevance",
  "competitorCoverage",
  "updatedMinutesAgo",
]);

function delay(ms = 0, signal?: AbortSignal): Promise<void> {
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

export async function fetchCompetitorGapsMock(
  req: CompetitorGapRequest,
  signal?: AbortSignal,
): Promise<PaginatedResponse<CompetitorKeywordGapRow>> {
  await delay(0, signal);
  const competitorIds = req.competitorIds.length ? req.competitorIds : DEFAULT_SELECTED;
  const variation = getScopeVariation(req);
  let rows = KEYWORDS.map((k) => buildRow(k, competitorIds, variation));

  const search = (req.search ?? "").trim().toLocaleLowerCase("tr-TR");
  if (search) rows = rows.filter((r) => r.keyword.toLocaleLowerCase("tr-TR").includes(search));

  const f = req.filters ?? {};
  if (f.competitorIds?.length) {
    const set = new Set(f.competitorIds);
    rows = rows.filter((r) => r.competitorRanks.some((cr) => set.has(r.id) || set.has(cr.appId)));
    // narrow best-of to the filter set
    rows = rows.map((r) => {
      const scoped = r.competitorRanks.filter((cr) => set.has(cr.appId));
      const ranked = scoped.filter((c) => c.rank != null) as { appId: string; rank: number }[];
      const best = ranked.length ? ranked.reduce((a, b) => (b.rank < a.rank ? b : a)) : null;
      return {
        ...r,
        bestCompetitorRank: best?.rank ?? null,
        bestCompetitorAppId: best?.appId ?? null,
        rankGap:
          r.ownRank != null && best
            ? r.ownRank - best.rank
            : r.ownRank == null && best
              ? 200 - best.rank
              : null,
        competitorCoverage: ranked.length,
      };
    });
  }
  const inRange = (v: number, min?: number, max?: number) =>
    (min == null || v >= min) && (max == null || v <= max);
  rows = rows.filter((r) => {
    const own = r.ownRank ?? 999;
    const comp = r.bestCompetitorRank ?? 999;
    return (
      inRange(own, f.ownRankMin, f.ownRankMax) &&
      inRange(comp, f.competitorRankMin, f.competitorRankMax) &&
      inRange(r.volumeScore, f.volumeMin, f.volumeMax) &&
      inRange(r.difficulty, f.difficultyMin, f.difficultyMax) &&
      inRange(r.relevance, f.relevanceMin, f.relevanceMax) &&
      inRange(r.opportunity, f.opportunityMin, f.opportunityMax)
    );
  });
  if (f.classifications?.length) {
    const set = new Set(f.classifications);
    rows = rows.filter((r) => set.has(r.classification));
  }
  if (f.updatedWithinMinutes != null) {
    rows = rows.filter((r) => r.updatedMinutesAgo <= f.updatedWithinMinutes!);
  }

  const sort = req.sorting?.[0];
  const competitorSortAppId = sort?.id.startsWith(COMPETITOR_SORT_PREFIX)
    ? sort.id.slice(COMPETITOR_SORT_PREFIX.length)
    : null;
  if (sort && (SORT_KEYS.has(sort.id) || competitorSortAppId)) {
    const dir = sort.desc ? -1 : 1;
    const read = competitorSortAppId
      ? (row: CompetitorKeywordGapRow) =>
          row.competitorRanks.find((entry) => entry.appId === competitorSortAppId)?.rank ?? null
      : (row: CompetitorKeywordGapRow) =>
          (row as unknown as Record<string, unknown>)[sort.id] ?? null;
    rows = rows
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const av = read(a.row);
        const bv = read(b.row);
        // Missing ranks always sink to the bottom, in both directions.
        if (av == null && bv == null) return a.index - b.index;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") {
          const cmp = av - bv;
          return cmp !== 0 ? cmp * dir : a.index - b.index;
        }
        const cmp = String(av).localeCompare(String(bv));
        return cmp !== 0 ? cmp * dir : a.index - b.index;
      })
      .map((d) => d.row);
  } else {
    rows = rows.slice().sort((a, b) => b.opportunity - a.opportunity);
  }

  return paginate(rows, req.page, req.pageSize);
}

/* ---------------- detail ---------------- */

function synthRankHistory(
  keyword: string,
  currentRank: number | null,
  days: number,
  jitter: number,
): { date: string; rank: number | null }[] {
  const points: { date: string; rank: number | null }[] = [];
  const seed = stableHash(keyword) + Math.round(jitter * 100);
  const anchor = currentRank == null ? 180 : Math.max(1, currentRank + 6);
  for (let i = days - 1; i >= 0; i--) {
    const t = 1 - i / Math.max(1, days - 1);
    const smooth = anchor + ((currentRank ?? 190) - anchor) * t;
    const wobble = (((seed + i * 11) % 9) - 4) * 0.6;
    const v = Math.max(1, Math.round(smooth + wobble));
    points.push({ date: isoDate(-i), rank: currentRank == null && i > 3 ? null : v });
  }
  return points;
}

export async function fetchCompetitorKeywordDetailMock(
  scope: ScopedRequest,
  rowId: string,
  competitorIds: string[],
): Promise<CompetitorKeywordDetail | null> {
  const kw = KEYWORDS.find((k) => keywordId(k.keyword) === rowId);
  if (!kw) return null;
  const v = getScopeVariation(scope);
  const row = buildRow(kw, competitorIds, v);
  const scopeSeed = `${scope.applicationId}|${scope.store}|${scope.countryCode}|${scope.dateRange.preset}`;
  return {
    row,
    serpStability: 100 - Math.round(row.difficulty * 0.6 + (100 - row.relevance) * 0.2),
    historyOwn: synthRankHistory(`${kw.keyword}-own|${scopeSeed}`, row.ownRank, 30, 0),
    historyByCompetitor: competitorIds.map((id, idx) => ({
      appId: id,
      points: synthRankHistory(
        `${kw.keyword}-${id}|${scopeSeed}`,
        row.competitorRanks.find((c) => c.appId === id)?.rank ?? null,
        30,
        idx + 1,
      ),
    })),
    lastRefreshedAt: new Date(Date.now() - row.updatedMinutesAgo * 60_000).toISOString(),
  };
}

/* ---------------- tracking (routes through unified repo) ---------------- */

export async function trackCompetitorKeywordMock(
  rowId: string,
): Promise<CompetitorKeywordGapRow | null> {
  const kw = KEYWORDS.find((k) => keywordId(k.keyword) === rowId);
  if (!kw) return null;
  // Route through the tracked-keyword mock so the tracked grid + dashboard
  // summary include the new keyword. It also flips the unified repo flag.
  await addKeywordMock(kw.keyword);
  trackedRepo.setTracked([rowId], true);
  return buildRow(kw, selectedIds);
}

export async function untrackCompetitorKeywordMock(
  rowId: string,
): Promise<CompetitorKeywordGapRow | null> {
  trackedRepo.setTracked([rowId], false);
  const kw = KEYWORDS.find((k) => keywordId(k.keyword) === rowId);
  if (!kw) return null;
  return buildRow(kw, selectedIds);
}

/** Test/reset helper — not used at runtime. */
export function __resetCompetitorsMock() {
  selectedIds = [...DEFAULT_SELECTED];
}
