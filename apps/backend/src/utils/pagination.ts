import type { PaginatedResponse, PaginationParams } from '@packages/shared';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Paginate an array of items
 * @param items - Array of items to paginate
 * @param params - Pagination parameters (page, limit)
 * @returns Paginated response with data and metadata
 */
export function paginate<TPayload>(
  items: TPayload[],
  params: PaginationParams = {},
): PaginatedResponse<TPayload> {
  const page = Math.max(1, Number(params.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.limit) || DEFAULT_LIMIT));

  const total = items.length;
  const totalPages = Math.ceil(total / limit);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const data = items.slice(startIndex, endIndex);

  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}
