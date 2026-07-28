/**
 * Centralized research fixtures.
 * All values are deterministic (derived from the keyword string) so the same
 * seed produces the same table on every render.
 */
import type { ResearchRecord, ResearchSourceId, ResearchSourceInfo } from "./types";

/* ---------------- Sources ---------------- */

export const RESEARCH_SOURCES: ResearchSourceInfo[] = [
  {
    id: "autocomplete",
    label: "Otomatik Tamamlama",
    short: "Otomatik Tamamlama",
    description: "Mağaza önerilerinden keşfedilen kelimeler.",
    available: true,
    defaultOn: true,
  },
  {
    id: "app_metadata",
    label: "Uygulama Mağaza Bilgileri",
    short: "Mağaza Bilgileri",
    description: "Seçili uygulamanın başlık ve açıklama alanlarından çıkarılan adaylar.",
    available: true,
    defaultOn: true,
  },
  {
    id: "competitor_metadata",
    label: "Rakip Mağaza Bilgileri",
    short: "Rakip",
    description: "Seçili rakiplerin mağaza metinlerinden çıkarılan adaylar.",
    available: true,
    defaultOn: true,
  },
  {
    id: "reviews",
    label: "Yorumlar",
    short: "Yorumlar",
    description: "Public yorum metinlerinde tekrar eden anlamlı terimler.",
    available: true,
    defaultOn: false,
  },
  {
    id: "related",
    label: "İlgili Anahtar Kelimeler",
    short: "İlgili",
    description: "Semantik ve sorgu ilişkisine göre genişletilen adaylar.",
    available: true,
    defaultOn: true,
  },
  {
    id: "apple_ads",
    label: "Apple Ads",
    short: "Apple Ads",
    description: "Erişilebildiği ölçüde reklam ve öneri kaynaklarından elde edilen adaylar.",
    available: false,
    defaultOn: false,
  },
  {
    id: "manual",
    label: "Manuel",
    short: "Manuel",
    description: "Kullanıcı tarafından doğrudan eklenen kelimeler.",
    available: true,
    defaultOn: false,
  },
];

export const SOURCE_MAP: Record<ResearchSourceId, ResearchSourceInfo> = Object.fromEntries(
  RESEARCH_SOURCES.map((s) => [s.id, s]),
) as Record<ResearchSourceId, ResearchSourceInfo>;

export const DEFAULT_SOURCES: ResearchSourceId[] = RESEARCH_SOURCES.filter((s) => s.defaultOn).map(
  (s) => s.id,
);

/* ---------------- Utilities ---------------- */

export function slugify(kw: string): string {
  return kw
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function clamp(v: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}

/* ---------------- Curated fixture: "kalori sayacı" ---------------- */

interface SeedRow {
  kw: string;
  sources: ResearchSourceId[];
  estimatedVolume: number;
  difficulty: number;
  relevance: number;
  meaningfulResultCount: number;
  top10AppPower: number;
  currentRank: number | null;
  rankingCompetitorCount: number;
  trackingStatus?: "tracked" | "candidate" | "none";
  favoriteStatus?: boolean;
  metadataStatus?: "in_use" | "candidate" | "not_used";
}

const CURATED_KALORI: SeedRow[] = [
  {
    kw: "kalori sayacı",
    sources: ["autocomplete", "app_metadata", "related"],
    estimatedVolume: 88,
    difficulty: 62,
    relevance: 96,
    meaningfulResultCount: 187,
    top10AppPower: 78,
    currentRank: 14,
    rankingCompetitorCount: 4,
    trackingStatus: "tracked",
    favoriteStatus: true,
    metadataStatus: "in_use",
  },
  {
    kw: "kalori hesaplama",
    sources: ["autocomplete", "related", "reviews"],
    estimatedVolume: 74,
    difficulty: 48,
    relevance: 91,
    meaningfulResultCount: 146,
    top10AppPower: 66,
    currentRank: 42,
    rankingCompetitorCount: 3,
    metadataStatus: "candidate",
  },
  {
    kw: "günlük kalori",
    sources: ["autocomplete", "app_metadata"],
    estimatedVolume: 61,
    difficulty: 39,
    relevance: 89,
    meaningfulResultCount: 112,
    top10AppPower: 58,
    currentRank: 27,
    rankingCompetitorCount: 2,
    trackingStatus: "tracked",
  },
  {
    kw: "kalori takip",
    sources: ["autocomplete", "competitor_metadata"],
    estimatedVolume: 67,
    difficulty: 45,
    relevance: 94,
    meaningfulResultCount: 128,
    top10AppPower: 61,
    currentRank: 22,
    rankingCompetitorCount: 3,
    metadataStatus: "in_use",
  },
  {
    kw: "yemek kalori",
    sources: ["autocomplete", "reviews"],
    estimatedVolume: 52,
    difficulty: 34,
    relevance: 82,
    meaningfulResultCount: 96,
    top10AppPower: 49,
    currentRank: null,
    rankingCompetitorCount: 1,
  },
  {
    kw: "kalori cetveli",
    sources: ["related"],
    estimatedVolume: 38,
    difficulty: 22,
    relevance: 76,
    meaningfulResultCount: 71,
    top10AppPower: 42,
    currentRank: null,
    rankingCompetitorCount: 0,
  },
  {
    kw: "kilo verme",
    sources: ["autocomplete", "competitor_metadata", "reviews"],
    estimatedVolume: 91,
    difficulty: 84,
    relevance: 68,
    meaningfulResultCount: 220,
    top10AppPower: 88,
    currentRank: 96,
    rankingCompetitorCount: 4,
  },
  {
    kw: "diyet takip",
    sources: ["autocomplete", "competitor_metadata", "related"],
    estimatedVolume: 79,
    difficulty: 71,
    relevance: 84,
    meaningfulResultCount: 176,
    top10AppPower: 74,
    currentRank: 61,
    rankingCompetitorCount: 3,
    trackingStatus: "candidate",
  },
  {
    kw: "beslenme günlüğü",
    sources: ["related", "reviews"],
    estimatedVolume: 46,
    difficulty: 33,
    relevance: 87,
    meaningfulResultCount: 84,
    top10AppPower: 51,
    currentRank: null,
    rankingCompetitorCount: 1,
  },
  {
    kw: "makro hesaplama",
    sources: ["related", "app_metadata"],
    estimatedVolume: 41,
    difficulty: 29,
    relevance: 81,
    meaningfulResultCount: 66,
    top10AppPower: 44,
    currentRank: null,
    rankingCompetitorCount: 1,
    metadataStatus: "candidate",
  },
  {
    kw: "protein hesaplama",
    sources: ["autocomplete", "related"],
    estimatedVolume: 44,
    difficulty: 31,
    relevance: 72,
    meaningfulResultCount: 78,
    top10AppPower: 48,
    currentRank: null,
    rankingCompetitorCount: 0,
  },
  {
    kw: "su takip",
    sources: ["autocomplete", "competitor_metadata"],
    estimatedVolume: 55,
    difficulty: 42,
    relevance: 63,
    meaningfulResultCount: 118,
    top10AppPower: 55,
    currentRank: null,
    rankingCompetitorCount: 2,
  },
  {
    kw: "adım sayar",
    sources: ["autocomplete", "competitor_metadata"],
    estimatedVolume: 82,
    difficulty: 76,
    relevance: 58,
    meaningfulResultCount: 198,
    top10AppPower: 81,
    currentRank: null,
    rankingCompetitorCount: 4,
  },
  {
    kw: "günlük adım",
    sources: ["related"],
    estimatedVolume: 49,
    difficulty: 41,
    relevance: 54,
    meaningfulResultCount: 92,
    top10AppPower: 52,
    currentRank: null,
    rankingCompetitorCount: 1,
  },
  {
    kw: "sağlıklı yaşam",
    sources: ["autocomplete", "reviews"],
    estimatedVolume: 63,
    difficulty: 68,
    relevance: 47,
    meaningfulResultCount: 152,
    top10AppPower: 71,
    currentRank: null,
    rankingCompetitorCount: 2,
  },
  {
    kw: "egzersiz takip",
    sources: ["competitor_metadata", "related"],
    estimatedVolume: 58,
    difficulty: 55,
    relevance: 66,
    meaningfulResultCount: 134,
    top10AppPower: 63,
    currentRank: null,
    rankingCompetitorCount: 2,
  },
  {
    kw: "kilo takip",
    sources: ["autocomplete", "competitor_metadata"],
    estimatedVolume: 60,
    difficulty: 51,
    relevance: 78,
    meaningfulResultCount: 121,
    top10AppPower: 59,
    currentRank: 74,
    rankingCompetitorCount: 2,
    trackingStatus: "tracked",
  },
  {
    kw: "vücut kitle indeksi",
    sources: ["related"],
    estimatedVolume: 36,
    difficulty: 24,
    relevance: 62,
    meaningfulResultCount: 58,
    top10AppPower: 39,
    currentRank: null,
    rankingCompetitorCount: 0,
  },
  {
    kw: "öğün planlama",
    sources: ["related", "reviews"],
    estimatedVolume: 42,
    difficulty: 36,
    relevance: 74,
    meaningfulResultCount: 88,
    top10AppPower: 50,
    currentRank: null,
    rankingCompetitorCount: 1,
  },
  {
    kw: "yemek günlüğü",
    sources: ["autocomplete", "related"],
    estimatedVolume: 47,
    difficulty: 32,
    relevance: 80,
    meaningfulResultCount: 94,
    top10AppPower: 46,
    currentRank: null,
    rankingCompetitorCount: 1,
  },
];

/* Additional seeded packs so alternate methods still surface content. */

const CURATED_ADIM: SeedRow[] = [
  {
    kw: "adım sayar",
    sources: ["autocomplete", "app_metadata"],
    estimatedVolume: 82,
    difficulty: 76,
    relevance: 88,
    meaningfulResultCount: 198,
    top10AppPower: 81,
    currentRank: 18,
    rankingCompetitorCount: 4,
    trackingStatus: "tracked",
  },
  {
    kw: "günlük adım",
    sources: ["autocomplete", "related"],
    estimatedVolume: 58,
    difficulty: 44,
    relevance: 82,
    meaningfulResultCount: 111,
    top10AppPower: 60,
    currentRank: 33,
    rankingCompetitorCount: 2,
  },
  {
    kw: "yürüyüş takip",
    sources: ["related", "reviews"],
    estimatedVolume: 47,
    difficulty: 36,
    relevance: 79,
    meaningfulResultCount: 92,
    top10AppPower: 52,
    currentRank: null,
    rankingCompetitorCount: 1,
  },
  {
    kw: "podometre",
    sources: ["autocomplete"],
    estimatedVolume: 41,
    difficulty: 28,
    relevance: 74,
    meaningfulResultCount: 68,
    top10AppPower: 45,
    currentRank: null,
    rankingCompetitorCount: 0,
  },
  {
    kw: "yürüyüş mesafesi",
    sources: ["related"],
    estimatedVolume: 33,
    difficulty: 24,
    relevance: 71,
    meaningfulResultCount: 54,
    top10AppPower: 39,
    currentRank: null,
    rankingCompetitorCount: 0,
  },
];

const CURATED_FITLOOP_APP: SeedRow[] = [
  {
    kw: "fitness takip",
    sources: ["app_metadata"],
    estimatedVolume: 71,
    difficulty: 63,
    relevance: 92,
    meaningfulResultCount: 164,
    top10AppPower: 70,
    currentRank: 29,
    rankingCompetitorCount: 3,
  },
  {
    kw: "antrenman günlüğü",
    sources: ["app_metadata", "reviews"],
    estimatedVolume: 55,
    difficulty: 41,
    relevance: 88,
    meaningfulResultCount: 108,
    top10AppPower: 56,
    currentRank: null,
    rankingCompetitorCount: 2,
    metadataStatus: "candidate",
  },
  {
    kw: "günlük egzersiz",
    sources: ["app_metadata"],
    estimatedVolume: 62,
    difficulty: 49,
    relevance: 84,
    meaningfulResultCount: 126,
    top10AppPower: 61,
    currentRank: 44,
    rankingCompetitorCount: 2,
  },
  {
    kw: "spor takibi",
    sources: ["app_metadata", "related"],
    estimatedVolume: 48,
    difficulty: 37,
    relevance: 79,
    meaningfulResultCount: 96,
    top10AppPower: 53,
    currentRank: null,
    rankingCompetitorCount: 1,
  },
  {
    kw: "sağlık takip",
    sources: ["app_metadata"],
    estimatedVolume: 68,
    difficulty: 58,
    relevance: 76,
    meaningfulResultCount: 148,
    top10AppPower: 67,
    currentRank: 82,
    rankingCompetitorCount: 3,
  },
];

const CURATED_COMPETITORS: SeedRow[] = [
  {
    kw: "fitness planlayıcı",
    sources: ["competitor_metadata"],
    estimatedVolume: 52,
    difficulty: 44,
    relevance: 78,
    meaningfulResultCount: 104,
    top10AppPower: 58,
    currentRank: null,
    rankingCompetitorCount: 3,
  },
  {
    kw: "günlük antrenman",
    sources: ["competitor_metadata", "related"],
    estimatedVolume: 58,
    difficulty: 51,
    relevance: 82,
    meaningfulResultCount: 122,
    top10AppPower: 62,
    currentRank: null,
    rankingCompetitorCount: 4,
  },
  {
    kw: "kalori sayacı ücretsiz",
    sources: ["competitor_metadata"],
    estimatedVolume: 66,
    difficulty: 47,
    relevance: 88,
    meaningfulResultCount: 136,
    top10AppPower: 61,
    currentRank: 51,
    rankingCompetitorCount: 3,
    metadataStatus: "candidate",
  },
  {
    kw: "diyet günlüğü",
    sources: ["competitor_metadata", "reviews"],
    estimatedVolume: 61,
    difficulty: 46,
    relevance: 85,
    meaningfulResultCount: 118,
    top10AppPower: 57,
    currentRank: null,
    rankingCompetitorCount: 3,
  },
];

const CURATED_CATEGORY: SeedRow[] = [
  {
    kw: "sağlık ve fitness",
    sources: ["related"],
    estimatedVolume: 84,
    difficulty: 78,
    relevance: 62,
    meaningfulResultCount: 210,
    top10AppPower: 82,
    currentRank: null,
    rankingCompetitorCount: 4,
  },
  {
    kw: "meditasyon uygulaması",
    sources: ["related"],
    estimatedVolume: 71,
    difficulty: 66,
    relevance: 32,
    meaningfulResultCount: 168,
    top10AppPower: 76,
    currentRank: null,
    rankingCompetitorCount: 1,
  },
  {
    kw: "uyku takibi",
    sources: ["related"],
    estimatedVolume: 63,
    difficulty: 55,
    relevance: 46,
    meaningfulResultCount: 142,
    top10AppPower: 68,
    currentRank: null,
    rankingCompetitorCount: 2,
  },
  {
    kw: "nabız ölçer",
    sources: ["related"],
    estimatedVolume: 54,
    difficulty: 44,
    relevance: 38,
    meaningfulResultCount: 108,
    top10AppPower: 58,
    currentRank: null,
    rankingCompetitorCount: 1,
  },
  {
    kw: "su içme hatırlatıcı",
    sources: ["related", "autocomplete"],
    estimatedVolume: 46,
    difficulty: 32,
    relevance: 58,
    meaningfulResultCount: 82,
    top10AppPower: 47,
    currentRank: null,
    rankingCompetitorCount: 1,
  },
];

/* ---------------- Builder ---------------- */

function computeOpportunity(r: SeedRow): number {
  // Higher demand + relevance + lower difficulty + lower current rank = better opp.
  const rankFactor = r.currentRank == null ? 0.4 : Math.max(0, 1 - r.currentRank / 200);
  const raw =
    r.estimatedVolume * 0.35 +
    r.relevance * 0.3 +
    (100 - r.difficulty) * 0.2 +
    rankFactor * 100 * 0.15;
  return Math.round(clamp(raw));
}

function toRecord(r: SeedRow, seed: string): ResearchRecord {
  const id = slugify(r.kw);
  const words = r.kw.trim().split(/\s+/);
  const h = hash(r.kw);
  return {
    id,
    keyword: r.kw,
    normalizedKeyword: r.kw.toLocaleLowerCase("tr-TR"),
    seed,
    sources: r.sources,
    estimatedVolume: r.estimatedVolume,
    difficulty: r.difficulty,
    relevance: r.relevance,
    opportunity: computeOpportunity(r),
    meaningfulResultCount: r.meaningfulResultCount,
    top10AppPower: r.top10AppPower,
    currentRank: r.currentRank,
    rankingCompetitorCount: r.rankingCompetitorCount,
    trackingStatus: r.trackingStatus ?? "none",
    favoriteStatus: r.favoriteStatus ?? false,
    metadataStatus: r.metadataStatus ?? "not_used",
    charLength: r.kw.length,
    wordCount: words.length,
    updatedMinutesAgo: [12, 45, 60 * 2, 60 * 8, 60 * 24, 60 * 48][h % 6],
  };
}

/**
 * Build a stable candidate list for a set of seeds & sources.
 * The result is filtered so at least one selected source produced each row.
 */
export function buildResearchResults(
  seeds: string[],
  sources: ResearchSourceId[],
): ResearchRecord[] {
  const normalizedSeeds = seeds.map((s) => s.trim()).filter(Boolean);
  const primary = normalizedSeeds[0]?.toLocaleLowerCase("tr-TR") ?? "";
  let pool: SeedRow[] = [];

  if (primary.includes("kalori")) pool = pool.concat(CURATED_KALORI);
  if (primary.includes("adım") || primary.includes("adim")) pool = pool.concat(CURATED_ADIM);
  if (primary.includes("fit") || primary.includes("egzersiz"))
    pool = pool.concat(CURATED_FITLOOP_APP);
  if (pool.length === 0) {
    // Fallback — always show a meaningful set derived from the top curated pack.
    pool = CURATED_KALORI;
  }

  // Deduplicate by keyword.
  const map = new Map<string, SeedRow>();
  for (const row of pool) map.set(row.kw, row);
  const rows = Array.from(map.values());

  const chosen = new Set(sources);
  const filtered = rows.filter((r) => r.sources.some((s) => chosen.has(s)));

  return filtered.map((r) => toRecord(r, normalizedSeeds[0] ?? ""));
}

export function buildForApp(sources: ResearchSourceId[]): ResearchRecord[] {
  const pool = [...CURATED_FITLOOP_APP, ...CURATED_KALORI.slice(0, 6)];
  const chosen = new Set(sources);
  return pool
    .filter((r) => r.sources.some((s) => chosen.has(s)))
    .map((r) => toRecord(r, "FitLoop"));
}

export function buildForCompetitors(sources: ResearchSourceId[]): ResearchRecord[] {
  const pool = [...CURATED_COMPETITORS, ...CURATED_KALORI.slice(0, 5)];
  const chosen = new Set(sources);
  return pool
    .filter((r) => r.sources.some((s) => chosen.has(s)))
    .map((r) => toRecord(r, "Rakipler"));
}

export function buildForCategory(sources: ResearchSourceId[]): ResearchRecord[] {
  const pool = [...CURATED_CATEGORY, ...CURATED_KALORI.slice(0, 4)];
  const chosen = new Set(sources);
  return pool
    .filter((r) => r.sources.some((s) => chosen.has(s)))
    .map((r) => toRecord(r, "Sağlık ve Fitness"));
}
