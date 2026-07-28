/**
 * Standard server-side-ready request parameters shared by list endpoints.
 */

export type SortDirection = "asc" | "desc";

export interface SortParam {
  id: string;
  desc: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ListRequest<TFilters = Record<string, unknown>> extends PaginationParams {
  search?: string;
  sorting?: SortParam[];
  filters?: TFilters;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 25;
