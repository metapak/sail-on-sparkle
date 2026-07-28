/**
 * Data-source adapter selection. Reads `VITE_DATA_SOURCE` and `VITE_API_BASE_URL`
 * from the environment; defaults to the local mock backend so the prototype
 * keeps working without configuration.
 */
export type DataSourceMode = "mock" | "api";

const rawSource = (import.meta.env.VITE_DATA_SOURCE ?? "mock").toString().toLowerCase();
export const DATA_SOURCE: DataSourceMode = rawSource === "api" ? "api" : "mock";

export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? "").toString();

export const IS_MOCK = DATA_SOURCE === "mock";
