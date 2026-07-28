/**
 * Neutral response contracts shared by every service. Backend adapters (mock
 * or HTTP) map their internal shapes into these.
 */

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DataFreshness {
  fetchedAt: number;
  sourceUpdatedAt: number;
  isStale: boolean;
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

export function freshness(sourceUpdatedAt: number, staleMs = 5 * 60_000): DataFreshness {
  const now = Date.now();
  return {
    fetchedAt: now,
    sourceUpdatedAt,
    isStale: now - sourceUpdatedAt > staleMs,
  };
}
