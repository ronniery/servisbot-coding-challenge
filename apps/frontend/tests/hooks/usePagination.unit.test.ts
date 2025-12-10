import { describe, expect, it, vi } from 'vitest';

import { act, renderHook, waitFor } from '@testing-library/react';

import { usePagination } from '@/hooks/usePagination';

describe('usePagination', () => {
  it('should load first page on mount', async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      data: [1, 2, 3],
      pagination: { hasNext: true },
    });

    const { result } = renderHook(() => usePagination(fetchPage));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items).toEqual([1, 2, 3]);
    expect(result.current.hasMore).toBe(true);
    expect(fetchPage).toHaveBeenCalledWith(1);
  });

  it('should load next page', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({
        data: [1, 2, 3],
        pagination: { hasNext: true },
      })
      .mockResolvedValueOnce({
        data: [4, 5, 6],
        pagination: { hasNext: false },
      });

    const { result } = renderHook(() => usePagination(fetchPage));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.loadNext();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.current.hasMore).toBe(false);
    expect(fetchPage).toHaveBeenCalledWith(2);
  });

  it('should not load if items already exist on mount', async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      data: [1],
      pagination: { hasNext: false },
    });

    const { result, rerender } = renderHook(() => usePagination(fetchPage));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchPage).toHaveBeenCalledTimes(1);

    rerender();

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
