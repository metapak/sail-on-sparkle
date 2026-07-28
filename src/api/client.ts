/**
 * Shared HTTP client. Pages/services never call `fetch` directly.
 * In mock mode this file is unused; service adapters short-circuit to their
 * mock implementations. Ready for a real FastAPI backend.
 */
import { API_BASE_URL } from "./config";
import { ApiError, normalizeError } from "./errors";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Auth token placeholder — future integration point. */
  authToken?: string | null;
  headers?: Record<string, string>;
}

function buildQuery(params?: RequestOptions["query"]): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of entries) qs.set(k, String(v));
  return `?${qs.toString()}`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError({
      code: "no_backend",
      message:
        "VITE_API_BASE_URL tanımlı değil. Prototip mock modunda çalışıyor; HTTP çağrıları için ortam değişkenini ayarlayın.",
    });
  }

  const { method = "GET", query, body, signal, timeoutMs = 20_000, authToken, headers } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(new DOMException("Timeout", "AbortError")),
    timeoutMs,
  );
  const composedSignal = signal ? mergeSignals(signal, controller.signal) : controller.signal;

  try {
    const res = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
      method,
      signal: composedSignal,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      let payload: Record<string, unknown> = {};
      try {
        payload = await res.json();
      } catch {
        /* ignore */
      }
      throw new ApiError({
        code: String(payload.code ?? `http_${res.status}`),
        message: String(payload.message ?? res.statusText),
        status: res.status,
        details: payload,
      });
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err) {
    throw normalizeError(err);
  } finally {
    clearTimeout(timeoutId);
  }
}

function mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const ctrl = new AbortController();
  const onAbort = (signal: AbortSignal) => () => ctrl.abort(signal.reason);
  if (a.aborted) ctrl.abort(a.reason);
  else a.addEventListener("abort", onAbort(a));
  if (b.aborted) ctrl.abort(b.reason);
  else b.addEventListener("abort", onAbort(b));
  return ctrl.signal;
}
