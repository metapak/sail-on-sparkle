/**
 * Central analytical market + application registries.
 *
 * The country → market-locale mapping lives here and NOWHERE else. Pages,
 * selectors and services must not re-derive it.
 */
import type { StoreId } from "./types";

export interface AnalysisMarket {
  countryCode: string;
  /** One primary market-analysis language per country (product decision). */
  primaryMarketLocale: string;
  supportedStores: StoreId[];
  /** Visible label (Turkish interface). */
  label: string;
  enabled: boolean;
}

export const ANALYSIS_MARKETS: Record<string, AnalysisMarket> = {
  TR: {
    countryCode: "TR",
    primaryMarketLocale: "tr",
    supportedStores: ["app-store", "google-play"],
    label: "Türkiye",
    enabled: true,
  },
  US: {
    countryCode: "US",
    primaryMarketLocale: "en",
    supportedStores: ["app-store", "google-play"],
    label: "ABD",
    enabled: true,
  },
  DE: {
    countryCode: "DE",
    primaryMarketLocale: "de",
    supportedStores: ["app-store", "google-play"],
    label: "Almanya",
    enabled: true,
  },
  SA: {
    countryCode: "SA",
    primaryMarketLocale: "ar",
    supportedStores: ["app-store", "google-play"],
    label: "Suudi Arabistan",
    enabled: true,
  },
  AE: {
    countryCode: "AE",
    primaryMarketLocale: "ar",
    supportedStores: ["google-play"],
    label: "Birleşik Arap Emirlikleri",
    enabled: true,
  },
};

export const ANALYSIS_MARKET_LIST: AnalysisMarket[] = Object.values(ANALYSIS_MARKETS).filter(
  (m) => m.enabled,
);

export const STORE_LABEL: Record<StoreId, string> = {
  "app-store": "App Store",
  "google-play": "Google Play",
};

export const STORE_IDS: StoreId[] = ["app-store", "google-play"];

export interface AnalysisApplication {
  id: string;
  name: string;
  supportedStores: StoreId[];
  defaultCountryCode: string;
}

export const ANALYSIS_APPLICATIONS: AnalysisApplication[] = [
  {
    id: "fitloop",
    name: "FitLoop",
    supportedStores: ["app-store", "google-play"],
    defaultCountryCode: "TR",
  },
  {
    id: "fitloop-lite",
    name: "FitLoop Lite",
    supportedStores: ["google-play"],
    defaultCountryCode: "TR",
  },
  {
    id: "caloriemate",
    name: "CalorieMate",
    supportedStores: ["app-store", "google-play"],
    defaultCountryCode: "US",
  },
  {
    id: "stepdaily",
    name: "StepDaily",
    supportedStores: ["app-store"],
    defaultCountryCode: "DE",
  },
];

export function getApplication(id: string): AnalysisApplication | undefined {
  return ANALYSIS_APPLICATIONS.find((a) => a.id === id);
}

export function getMarket(countryCode: string): AnalysisMarket | undefined {
  const m = ANALYSIS_MARKETS[countryCode?.toUpperCase?.() ?? ""];
  return m?.enabled ? m : undefined;
}

/** Single source of truth for country → market locale. */
export function resolveMarketLocale(countryCode: string): string {
  return getMarket(countryCode)?.primaryMarketLocale ?? DEFAULT_MARKET.primaryMarketLocale;
}

export const DEFAULT_APPLICATION = ANALYSIS_APPLICATIONS[0];
export const DEFAULT_MARKET = ANALYSIS_MARKETS.TR;
export const DEFAULT_STORE: StoreId = "app-store";
