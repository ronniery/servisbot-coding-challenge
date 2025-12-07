import { useCallback, useEffect, useState } from "react";

export type PaginatedResponse<TData> = {
  data: TData[];
  pagination: {
    hasNext: boolean;
  };
};

export type PaginatedFetcher<TData> = (
  page: number,
) => Promise<PaginatedResponse<TData>>;

export type UsePaginatedListOptions = {
  /**
   * If false, the hook will NOT auto-load the first page.
   * Useful for accordions (load only when expanded).
   */
  enabled?: boolean;
};

export type UsePaginatedListReturn<TData> = {
  items: TData[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  loadFirstPage: () => void;
  loadMore: () => void;
  reset: () => void;
};

export function usePagination<TData>(
  fetchPage: PaginatedFetcher<TData>,
  { enabled = true }: UsePaginatedListOptions = {},
): UsePaginatedListReturn<TData> {
  const [items, setItems] = useState<TData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(
    (pageToLoad: number, reset: boolean = false) => {
      setIsLoading(true);

      fetchPage(pageToLoad)
        .then((response) => {
          setItems((prev) =>
            reset ? response.data : [...prev, ...response.data],
          );
          setHasMore(response.pagination.hasNext);
          setPage(pageToLoad);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [fetchPage],
  );

  const loadFirstPage = useCallback(() => {
    load(1, true);
  }, [load]);

  const loadMore = useCallback(() => {
    load(page + 1);
  }, [load, page]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
  }, []);

  useEffect(() => {
    // Auto-load first page if enabled and nothing loaded yet
    if (!enabled) return;
    if (items.length > 0) return;

    loadFirstPage();
  }, [enabled, items.length, loadFirstPage]);

  return {
    items,
    page,
    hasMore,
    isLoading,
    loadFirstPage,
    loadMore,
    reset,
  };
}
