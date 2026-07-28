/**
 * Centralized historical rank data + selectors for the Sonar chart system.
 *
 * All summary values (current / start / best / worst / period deltas) MUST
 * be derived from the same visible dataset via the selectors below so the
 * chart and the surrounding metric tiles never disagree.
 */

export interface RankPoint {
  /** ISO date (yyyy-mm-dd) of the observation. */
  date: string;
  /** Observed rank on that date, or null if we did not measure a rank. */
  rank: number | null;
}

export interface RankEvent {
  date: string;
  type: "metadata" | "competitor" | "refresh";
  title: string;
  description: string;
}

export interface KeywordHistory {
  keyword: string;
  firstTrackedAt: string;
  nextRefreshAt: string;
  points: RankPoint[];
  events: RankEvent[];
}

/* ------------------------------------------------------------------ */
/* Data — kept small and hand-authored so summaries stay realistic.    */
/* ------------------------------------------------------------------ */

// Default keyword — matches the product brief exactly.
// 30-day trajectory: start #30 → best #14 → recovers to #18 today.
// 7 days ago (2026-07-17): #21 → today #18 = +3 sıra.
// 30-day delta: 30 → 18 = +12 sıra.
const KALORI_SAYACI_30: RankPoint[] = [
  { date: "2026-06-25", rank: 30 },
  { date: "2026-06-26", rank: 30 },
  { date: "2026-06-27", rank: 29 },
  { date: "2026-06-28", rank: 29 },
  { date: "2026-06-29", rank: 28 },
  { date: "2026-06-30", rank: 27 },
  { date: "2026-07-01", rank: 27 },
  { date: "2026-07-02", rank: 26 },
  { date: "2026-07-03", rank: 25 },
  { date: "2026-07-04", rank: 23 },
  { date: "2026-07-05", rank: 22 },
  { date: "2026-07-06", rank: 20 },
  { date: "2026-07-07", rank: 18 },
  { date: "2026-07-08", rank: 17 },
  { date: "2026-07-09", rank: 16 },
  { date: "2026-07-10", rank: 15 },
  { date: "2026-07-11", rank: 14 },
  { date: "2026-07-12", rank: 14 },
  { date: "2026-07-13", rank: 15 },
  { date: "2026-07-14", rank: 16 },
  { date: "2026-07-15", rank: 18 },
  { date: "2026-07-16", rank: 20 },
  { date: "2026-07-17", rank: 21 },
  { date: "2026-07-18", rank: 20 },
  { date: "2026-07-19", rank: 21 },
  { date: "2026-07-20", rank: 19 },
  { date: "2026-07-21", rank: 19 },
  { date: "2026-07-22", rank: 18 },
  { date: "2026-07-23", rank: 18 },
  { date: "2026-07-24", rank: 18 },
];

// Extend backwards for the 90-day view — slower drift, continuous series.
function extendBackwards(base: RankPoint[], extraDays: number): RankPoint[] {
  const first = base[0];
  const firstDate = new Date(first.date);
  const startRank = 38;
  const endRank = first.rank ?? 30;
  const extras: RankPoint[] = [];
  for (let i = extraDays; i >= 1; i--) {
    const d = new Date(firstDate);
    d.setDate(d.getDate() - i);
    const t = (extraDays - i) / extraDays;
    let r = Math.round(startRank + (endRank - startRank) * t);
    if (i === 40 || i === 39) r += 2;
    if (i === 20) r += 1;
    extras.push({ date: d.toISOString().slice(0, 10), rank: Math.max(1, r) });
  }
  return [...extras, ...base];
}

const KALORI_SAYACI_90: RankPoint[] = extendBackwards(KALORI_SAYACI_30, 60);

const KALORI_SAYACI_HISTORY: KeywordHistory = {
  keyword: "kalori sayacı",
  firstTrackedAt: "2026-04-25",
  nextRefreshAt: "2026-07-25",
  points: KALORI_SAYACI_90,
  events: [
    {
      date: "2026-07-14",
      type: "metadata",
      title: "Metadata güncellendi",
      description: "Alt başlık ve anahtar kelime alanı güncellendi.",
    },
    {
      date: "2026-07-19",
      type: "competitor",
      title: "FitTrack Pro başlığını değiştirdi",
      description: "Rakip uygulama başlığında “kalori” terimini öne çıkardı.",
    },
    {
      date: "2026-07-23",
      type: "refresh",
      title: "Veri yeniden tarandı",
      description: "Mağaza sıralaması periyodik olarak yeniden ölçüldü.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Fallback synthesis for other demo keywords.                         */
/* ------------------------------------------------------------------ */

interface KeywordSeed {
  currentRank: number | null;
  change30d: number; // positive = improvement
}

function synthesizeHistory(keyword: string, seed: KeywordSeed, days: number): RankPoint[] {
  const today = new Date("2026-07-24");
  const current = seed.currentRank ?? 200;
  const start = Math.max(1, current + seed.change30d);
  const points: RankPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const t = 1 - i / (days - 1);
    const smooth = start + (current - start) * t;
    // Smooth, deterministic drift — a hash-based jitter produced a sawtooth
    // that read as real volatility in the comparison chart.
    const phase = (keyword.length % 7) + 1;
    const wobble = Math.sin((i / phase) * 0.6) * 1.2;
    const rank: number = Math.max(1, Math.round(smooth + wobble));
    points.push({ date: d.toISOString().slice(0, 10), rank });
  }
  // ensure last equals current
  if (points.length > 0) points[points.length - 1].rank = seed.currentRank;
  return points;
}

export function getKeywordHistory(
  keyword: string,
  currentRank: number | null,
  change30d: number,
): KeywordHistory {
  if (keyword === "kalori sayacı") return KALORI_SAYACI_HISTORY;
  return {
    keyword,
    firstTrackedAt: "2026-04-25",
    nextRefreshAt: "2026-07-25",
    points: synthesizeHistory(keyword, { currentRank, change30d }, 90),
    events: [],
  };
}

/* ------------------------------------------------------------------ */
/* Selectors — the chart and the summary tiles read from these.        */
/* ------------------------------------------------------------------ */

export type RangeDays = 7 | 30 | 90;

/**
 * Chronological, de-duplicated observations. Every range selector and every
 * chart reads through this so axis ticks can never repeat or run backwards.
 */
export function normalizeRankPoints(points: RankPoint[]): RankPoint[] {
  const byDate = new Map<string, RankPoint>();
  for (const p of points) byDate.set(p.date, p);
  return Array.from(byDate.values()).sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
}

export function sliceRange(history: KeywordHistory, days: RangeDays): RankPoint[] {
  // Take the last (days + 1) points so "period start" comparison is
  // meaningful (points at the boundaries included).
  const ordered = normalizeRankPoints(history.points);
  const desired = Math.min(days + 1, ordered.length);
  return ordered.slice(ordered.length - desired);
}

export function eventsInRange(history: KeywordHistory, range: RankPoint[]): RankEvent[] {
  if (range.length === 0) return [];
  const from = range[0].date;
  const to = range[range.length - 1].date;
  return history.events.filter((e) => e.date >= from && e.date <= to);
}

export interface RangeSummary {
  points: RankPoint[];
  validPoints: RankPoint[];
  currentRank: number | null;
  startRank: number | null;
  bestRank: number | null;
  worstRank: number | null;
  periodDelta: number | null;
  sevenDayDelta: number | null;
  thirtyDayDelta: number | null;
  fromDate: string | null;
  toDate: string | null;
  hasEnoughData: boolean;
}

const MIN_VALID_POINTS = 7;

function deltaOverDays(
  history: KeywordHistory,
  current: number,
  currentDate: string,
  days: number,
): number | null {
  const cutoff = new Date(currentDate);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  const past = [...history.points].filter((p) => p.rank != null && p.date <= cutoffIso).pop() as
    | (RankPoint & { rank: number })
    | undefined;
  return past ? past.rank - current : null;
}

export function summarizeRange(history: KeywordHistory, days: RangeDays): RangeSummary {
  const points = sliceRange(history, days);
  const valid = points.filter((p) => p.rank != null) as Array<RankPoint & { rank: number }>;
  if (valid.length === 0) {
    return {
      points,
      validPoints: [],
      currentRank: null,
      startRank: null,
      bestRank: null,
      worstRank: null,
      periodDelta: null,
      sevenDayDelta: null,
      thirtyDayDelta: null,
      fromDate: points[0]?.date ?? null,
      toDate: points[points.length - 1]?.date ?? null,
      hasEnoughData: false,
    };
  }
  const current = valid[valid.length - 1].rank;
  const start = valid[0].rank;
  const best = Math.min(...valid.map((p) => p.rank));
  const worst = Math.max(...valid.map((p) => p.rank));
  const period = start - current;

  const currentDate = valid[valid.length - 1].date;
  const sevenDelta = deltaOverDays(history, current, currentDate, 7);
  const thirtyDelta = deltaOverDays(history, current, currentDate, 30);

  return {
    points,
    validPoints: valid,
    currentRank: current,
    startRank: start,
    bestRank: best,
    worstRank: worst,
    periodDelta: period,
    sevenDayDelta: sevenDelta,
    thirtyDayDelta: thirtyDelta,
    fromDate: points[0].date,
    toDate: points[points.length - 1].date,
    hasEnoughData: valid.length >= MIN_VALID_POINTS,
  };
}

export function findRankBeforeDate(history: KeywordHistory, date: string): number | null {
  for (let i = history.points.length - 1; i >= 0; i--) {
    const p = history.points[i];
    if (p.date < date && p.rank != null) return p.rank;
  }
  return null;
}

export function findRankOnOrAfterDate(history: KeywordHistory, date: string): number | null {
  for (const p of history.points) {
    if (p.date > date && p.rank != null) return p.rank;
  }
  return null;
}

export function formatTrDate(iso: string): string {
  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
