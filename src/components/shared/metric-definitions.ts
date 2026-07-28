/**
 * Central metric dictionary (i18n-ready).
 *
 * ONE definition per analytical metric: label, optional short label, and the
 * Turkish explanation surfaced by `SharedMetricHeader` tooltips. Routes must
 * never hardcode metric explanations — they reference a metric key instead,
 * so the same metric reads identically everywhere in the product.
 *
 * `key` values are stable i18n keys (`metric.<key>.tooltip` upstream); when a
 * real i18n layer lands, only this file needs to resolve through it.
 */

export type MetricUnit = "rank" | "score" | "count" | "ratio" | "delta" | "date" | "text";

export interface MetricDefinition {
  /** Stable i18n key. */
  key: string;
  /** Canonical Turkish label. */
  label: string;
  /** Optional short/abbreviated label for narrow columns. */
  short?: string;
  /** Turkish explanation shown in the header tooltip. */
  tooltip: string;
  /** Direction semantics: is a higher value better? */
  higherBetter?: boolean;
  lowerBetter?: boolean;
  /** Value semantics used by formatters and axes. */
  unit?: MetricUnit;
  /** Inclusive value range where meaningful (e.g. `[0, 100]`). */
  range?: [number, number];
  /** Default cell/header alignment for this metric. */
  align?: "left" | "right" | "center";
  /** Whether the metric carries semantic (good/bad) coloring. */
  semanticColor?: boolean;
  /** Shared display formatter — one implementation per metric. */
  format?: (value: number | null | undefined) => string;
}

const scoreFormat = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v)}`);
const rankFormat = (v: number | null | undefined) =>
  v == null ? "Top 200 İçinde Bulunamadı" : `#${v}`;
const deltaFormat = (v: number | null | undefined) =>
  v == null ? "—" : v === 0 ? "Stabil" : v > 0 ? `+${v}` : `${v}`;
const countFormat = (v: number | null | undefined) => (v == null ? "—" : `${v}`);

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  estimatedVolume: {
    key: "estimatedVolume",
    label: "Tahmini Aranma Hacmi",
    short: "Aranma Hacmi",
    tooltip:
      "Google Play için kesin aylık arama sayısı değildir. Birden fazla talep sinyalinden üretilen 0–100 arası göreceli tahmin skorudur.",
    higherBetter: true,
    unit: "score",
    range: [0, 100],
    align: "right",
    format: scoreFormat,
  },
  demand: {
    key: "demand",
    label: "Talep",
    short: "Talep",
    tooltip:
      "Bu anahtar kelimeye yönelik tahmini kullanıcı talebini gösteren 0–100 arası göreceli skor.",
    higherBetter: true,
    unit: "score",
    range: [0, 100],
    align: "right",
    format: scoreFormat,
  },

  difficulty: {
    key: "difficulty",
    label: "Zorluk",
    short: "Zorluk",
    tooltip:
      "Bu anahtar kelimede üst sıralara çıkmanın tahmini rekabet zorluğunu gösteren 0–100 arası skor.",
    lowerBetter: true,
    unit: "score",
    range: [0, 100],
    align: "right",
    semanticColor: true,
    format: scoreFormat,
  },
  opportunity: {
    key: "opportunity",
    label: "Fırsat Skoru",
    short: "Fırsat",
    tooltip:
      "Talep, zorluk, mevcut sıra, uygulama gücü ve alaka sinyallerini birleştiren uygulamaya özel fırsat skoru.",
    higherBetter: true,
    unit: "score",
    range: [0, 100],
    align: "right",
    semanticColor: true,
    format: scoreFormat,
  },
  relevance: {
    key: "relevance",
    label: "Alaka Düzeyi",
    short: "Alaka",
    tooltip:
      "Uygulama ile anahtar kelime arasındaki başlık, açıklama, kategori ve anlamsal uyumu gösteren 0–100 arası skor.",
    higherBetter: true,
    unit: "score",
    range: [0, 100],
    align: "right",
    format: scoreFormat,
  },
  serpStability: {
    key: "serpStability",
    label: "Sonuç Kararlılığı",
    short: "Kararlılık",
    tooltip:
      "Anahtar kelimenin sonuç kümesinin ölçülen geçmiş dönemde ne kadar kararlı ya da değişken olduğunu yansıtır. Düşük kararlılık, sıralamaya girmenin daha olası olduğu hareketli bir sonuç kümesine işaret eder.",
    unit: "score",
    range: [0, 100],
    align: "right",
    format: scoreFormat,
  },
  competitorCoverage: {
    key: "competitorCoverage",
    label: "Kapsama",
    short: "Kapsama",
    tooltip:
      "Seçili rakiplerin kaçının bu anahtar kelimede izlenen sıralama aralığında bulunduğunu gösterir. Örneğin 2/3, üç rakibin ikisinin bulunduğu anlamına gelir.",
    unit: "ratio",
    align: "right",
    format: countFormat,
  },
  currentRank: {
    key: "currentRank",
    label: "Mevcut Sıra",
    short: "Sıra",
    tooltip:
      "Uygulamanızın seçili ülke ve mağazada bu anahtar kelime için mevcut sıralaması. Sonuç bulunamazsa “Top 200 İçinde Bulunamadı” gösterilir.",
    lowerBetter: true,
    unit: "rank",
    align: "right",
    semanticColor: true,
    format: rankFormat,
  },
  bestCompetitorRank: {
    key: "bestCompetitorRank",
    label: "En İyi Rakip",
    short: "En İyi Rakip",
    tooltip:
      "İzlediğiniz rakipler arasında bu anahtar kelimede en yüksek sıralamaya sahip uygulamanın sırası.",
    lowerBetter: true,
    unit: "rank",
    align: "right",
    format: rankFormat,
  },
  rankGap: {
    key: "rankGap",
    label: "Sıra Farkı",
    short: "Sıra Farkı",
    tooltip:
      "Sizin sıralamanız ile en iyi rakibin sıralaması arasındaki fark. Pozitif fark rakibin önünüzde olduğunu gösterir.",
    lowerBetter: true,
    unit: "delta",
    align: "right",
    semanticColor: true,
    format: deltaFormat,
  },
  rankChange: {
    key: "rankChange",
    label: "30 Günlük Değişim",
    short: "30 Gün",
    tooltip:
      "Uygulamanın bu anahtar kelimedeki mevcut sırasının 30 gün önceki sıraya göre değişimi. Pozitif değer sıralamanın iyileştiğini gösterir.",
    higherBetter: true,
    unit: "delta",
    align: "right",
    semanticColor: true,
    format: deltaFormat,
  },
  rankChange7d: {
    key: "rankChange7d",
    label: "7 Günlük Değişim",
    short: "7G",
    tooltip:
      "Son 7 gündeki sıralama değişimidir. Pozitif değer iyileşme, negatif değer gerileme anlamına gelir.",
    higherBetter: true,
    unit: "delta",
    align: "right",
    semanticColor: true,
    format: deltaFormat,
  },

  bestRank: {
    key: "bestRank",
    label: "En İyi Sıra",
    tooltip: "Ölçülen dönemde ulaşılan en iyi (en küçük) sıralama değeridir.",
    lowerBetter: true,
  },
  worstRank: {
    key: "worstRank",
    label: "En Kötü Sıra",
    tooltip: "Ölçülen dönemde görülen en kötü (en büyük) sıralama değeridir.",
  },
  appPower: {
    key: "appPower",
    label: "Uygulama Gücü",
    short: "Güç",
    tooltip:
      "İlk sonuçlarda yer alan uygulamaların mağaza gücünü özetleyen göreli göstergedir. Yüksek değer, güçlü uygulamalarla rekabet edileceğini gösterir.",
    lowerBetter: true,
  },
  meaningfulResultCount: {
    key: "meaningfulResultCount",
    label: "Anlamlı Sonuç Sayısı",
    short: "Sonuç Sayısı",
    tooltip: "Bu sorgu için tespit edilen anlamlı mağaza sonucu sayısı.",
    higherBetter: true,
    unit: "count",
    align: "right",
    format: countFormat,
  },

  competitorCount: {
    key: "competitorCount",
    label: "Rakip Sayısı",
    tooltip: "Bu anahtar kelimede sıralama aldığı tespit edilen izlenen rakip sayısı.",
    unit: "count",
    align: "right",
    format: countFormat,
  },
  rankingCompetitorCount: {
    key: "rankingCompetitorCount",
    label: "Sıralamada Bulunan Rakip Sayısı",
    short: "Rakip Sayısı",
    tooltip: "Bu anahtar kelimede sıralamada bulunan rakip uygulamaların sayısını gösterir.",
    unit: "count",
    align: "right",
    format: countFormat,
  },
  trend30d: {
    key: "trend30d",
    label: "30 Günlük Eğilim",
    short: "Eğilim",
    tooltip:
      "Anahtar kelimenin mağaza sıralamasındaki son 30 günlük değişimi mini grafik üzerinde gösterir.",
  },
  titleCompetition: {
    key: "titleCompetition",
    label: "Başlık Rekabeti",
    tooltip:
      "İlk sonuçlardaki uygulamaların bu anahtar kelimeyi başlık ya da alt başlıkta ne yoğunlukta kullandığını gösterir.",
  },
  status: {
    key: "status",
    label: "Durum",
    tooltip:
      "Anahtar kelimenin talep, zorluk ve mevcut sıralama birleşiminden türeyen aksiyon sınıflandırmasıdır.",
  },
  sources: {
    key: "sources",
    label: "Kaynaklar",
    tooltip: "Anahtar kelimenin hangi keşif kaynaklarından bulunduğunu gösterir.",
  },
  sourceCount: {
    key: "sourceCount",
    label: "Kaynak Sayısı",
    tooltip: "Anahtar kelimeyi destekleyen farklı keşif kaynağı sayısını gösterir.",
  },
  trackingStatus: {
    key: "trackingStatus",
    label: "Takip Durumu",
    tooltip: "Anahtar kelimenin düzenli sıralama takibine eklenip eklenmediğini gösterir.",
  },
  metadataStatus: {
    key: "metadataStatus",
    label: "Mağaza Bilgilerinde Kullanım",
    tooltip:
      "Anahtar kelimenin mağaza bilgileri optimizasyonu için aday olarak kaydedilip kaydedilmediğini gösterir.",
  },
  updatedAt: {
    key: "updatedAt",
    label: "Son Güncelleme",
    tooltip: "Bu satırdaki sıralama ve metrik verilerinin en son ne zaman yenilendiği.",
    unit: "date",
  },
  refreshFrequency: {
    key: "refreshFrequency",
    label: "Yenileme Sıklığı",
    tooltip: "Anahtar kelime verisinin hangi aralıkla yeniden ölçüldüğünü gösterir.",
  },
  group: {
    key: "group",
    label: "Grup",
    tooltip: "Anahtar kelimenin atandığı çalışma grubudur.",
  },
};

/**
 * Column-id → metric-key aliases. Tables use domain-specific column ids
 * (`vol`, `diff`, `opp`, `top10AppPower`, …) but must resolve to the same
 * metric definition.
 */
export const METRIC_ALIASES: Record<string, string> = {
  vol: "estimatedVolume",
  volume: "estimatedVolume",
  estimatedVolume: "estimatedVolume",
  diff: "difficulty",
  difficulty: "difficulty",
  opp: "opportunity",
  opportunity: "opportunity",
  rel: "relevance",
  relevance: "relevance",
  rank: "currentRank",
  currentRank: "currentRank",
  ownRank: "currentRank",
  bestCompetitorRank: "bestCompetitorRank",
  rankGap: "rankGap",
  gap: "rankGap",
  demand: "demand",
  volumeScore: "estimatedVolume",
  change: "rankChange",
  change30: "rankChange",
  rankChange: "rankChange",
  rankChange30d: "rankChange",
  change7: "rankChange7d",
  change7d: "rankChange7d",
  sevenDayChange: "rankChange7d",
  best: "bestRank",
  bestRank: "bestRank",
  worst: "worstRank",
  worstRank: "worstRank",
  power: "appPower",
  appPower: "appPower",
  top10AppPower: "appPower",
  appStrength: "appPower",
  serp: "serpStability",
  serpStability: "serpStability",
  stability: "serpStability",
  coverage: "competitorCoverage",
  competitorCoverageRatio: "competitorCoverage",
  competitorCoverage: "competitorCoverage",
  rankingCompetitorCount: "rankingCompetitorCount",
  competitors: "competitorCount",
  competitorCount: "competitorCount",
  competitorsCount: "competitorCount",
  meaningfulResultCount: "meaningfulResultCount",
  titleComp: "titleCompetition",
  titleCompetition: "titleCompetition",
  status: "status",
  sources: "sources",
  sourceCount: "sourceCount",
  trackingStatus: "trackingStatus",
  metadataStatus: "metadataStatus",
  updated: "updatedAt",
  updatedMinutesAgo: "updatedAt",
  freq: "refreshFrequency",
  refreshFrequency: "refreshFrequency",
  group: "group",
};

/** Resolve a column id or metric key to its shared definition. */
export function getMetricDefinition(idOrKey?: string): MetricDefinition | undefined {
  if (!idOrKey) return undefined;
  const key = METRIC_ALIASES[idOrKey] ?? idOrKey;
  return METRIC_DEFINITIONS[key];
}

/** Tooltip text for a column id or metric key (empty when undefined). */
export function getMetricTooltip(idOrKey?: string): string | undefined {
  return getMetricDefinition(idOrKey)?.tooltip;
}

/**
 * Canonical Turkish label for a column id or metric key. Every table, card,
 * dialog and chart must read labels from here so terminology can never drift
 * between routes.
 */
export function metricLabel(idOrKey: string, fallback?: string): string {
  return getMetricDefinition(idOrKey)?.label ?? fallback ?? idOrKey;
}

/**
 * Centrally-defined compact label for narrow columns. Falls back to the
 * canonical label, which stays the tooltip/aria text everywhere.
 */
export function metricShortLabel(idOrKey: string, fallback?: string): string {
  const def = getMetricDefinition(idOrKey);
  return def?.short ?? def?.label ?? fallback ?? idOrKey;
}
