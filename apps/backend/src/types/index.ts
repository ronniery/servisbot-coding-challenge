/**
 * Pagination query parameters
 */
export type PaginationParams = {
  page?: number | undefined;
  limit?: number | undefined;
};

/**
 * Pagination metadata
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

/**
 * Paginated response wrapper
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};
