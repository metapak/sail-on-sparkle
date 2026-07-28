/**
 * Implementation-neutral API error type. Every service (mock or HTTP) must
 * normalize failures into `ApiError`. Pages/hooks never see backend-specific
 * error shapes.
 */
export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status?: number;
}

export class ApiError extends Error implements ApiErrorPayload {
  code: string;
  status?: number;
  details?: Record<string, unknown>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.status = payload.status;
    this.details = payload.details;
  }
}

export function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof DOMException && err.name === "AbortError") {
    return new ApiError({ code: "aborted", message: "İstek iptal edildi", status: 0 });
  }
  if (err instanceof Error) {
    return new ApiError({ code: "unknown", message: err.message });
  }
  return new ApiError({ code: "unknown", message: "Bilinmeyen hata" });
}
