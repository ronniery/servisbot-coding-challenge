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

export type UsePaginationOptions = {
  enabled?: boolean;
};

export type UsePagination<TData> = {
  items: TData[];
  hasMore: boolean;
  isLoading: boolean;
  isPageEmpty: boolean;
  loadNext: () => void;
};

export function usePagination<TData>(
  fetchPage: PaginatedFetcher<TData>,
): UsePagination<TData> {
  const [items, setItems] = useState<TData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isPageEmpty = items.length === 0;

  const load = useCallback(
    (nextPage: number, reset: boolean = false): void => {
      setIsLoading(true);

      fetchPage(nextPage)
        .then((response) => {
          setItems((prev) =>
            reset ? response.data : [...prev, ...response.data],
          );
          setHasMore(response.pagination.hasNext);
          setPage(nextPage);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [fetchPage],
  );

  const loadFirstPage = useCallback((): void => {
    load(1, true);
  }, [load]);

  const loadNext = useCallback((): void => {
    load(page + 1);
  }, [load, page]);

  useEffect(() => {
    if (items.length > 0) return;

    // eslint-disable-next-line
    loadFirstPage();
  }, [items.length, loadFirstPage]);

  return {
    items,
    isPageEmpty,
    hasMore,
    isLoading,
    loadNext,
  };
}
