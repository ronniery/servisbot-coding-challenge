import { describe, it, expect } from 'vitest';

import { paginate } from '../../src/utils/pagination';

describe('pagination', () => {
  const testData = Array.from({ length: 25 }, (_, index) => ({ id: index + 1, name: `Item ${index + 1}` }));

  describe('default pagination', () => {
    it('should use default page=1 and limit=10 when no params provided', () => {
      const result = paginate(testData, {});

      expect(result.data).toHaveLength(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should return first 10 items with default params', () => {
      const result = paginate(testData, {});

      expect(result.data[0]).toEqual({ id: 1, name: 'Item 1' });
      expect(result.data[9]).toEqual({ id: 10, name: 'Item 10' });
    });
  });

  describe('custom pagination', () => {
    it('should respect custom page parameter', () => {
      const result = paginate(testData, { page: 2 });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.page).toBe(2);
      expect(result.data[0]).toEqual({ id: 11, name: 'Item 11' });
    });

    it('should respect custom limit parameter', () => {
      const result = paginate(testData, { limit: 5 });

      expect(result.data).toHaveLength(5);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle both custom page and limit', () => {
      const result = paginate(testData, { page: 3, limit: 7 });

      expect(result.data).toHaveLength(7);
      expect(result.pagination.page).toBe(3);
      expect(result.pagination.limit).toBe(7);
      expect(result.data[0]).toEqual({ id: 15, name: 'Item 15' });
    });
  });

  describe('boundary conditions', () => {
    it('should enforce minimum page of 1', () => {
      const result = paginate(testData, { page: 0 });

      expect(result.pagination.page).toBe(1);
    });

    it('should enforce minimum page of 1 for negative values', () => {
      const result = paginate(testData, { page: -5 });

      expect(result.pagination.page).toBe(1);
    });

    it('should enforce maximum limit of 100', () => {
      const result = paginate(testData, { limit: 150 });

      expect(result.pagination.limit).toBe(100);
    });

    it('should enforce minimum limit of 1', () => {
      const result = paginate(testData, { limit: 0 });

      expect(result.pagination.limit).toBe(10); // Defaults to 10 when invalid
    });

    it('should return empty array for page beyond total pages', () => {
      const result = paginate(testData, { page: 100 });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.page).toBe(100);
      expect(result.pagination.total).toBe(25);
    });

    it('should handle last page with fewer items', () => {
      const result = paginate(testData, { page: 3, limit: 10 });

      expect(result.data).toHaveLength(5);
      expect(result.data[0]).toEqual({ id: 21, name: 'Item 21' });
      expect(result.data[4]).toEqual({ id: 25, name: 'Item 25' });
    });
  });

  describe('pagination metadata', () => {
    it('should correctly calculate hasNext and hasPrev for first page', () => {
      const result = paginate(testData, { page: 1, limit: 10 });

      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should correctly calculate hasNext and hasPrev for middle page', () => {
      const result = paginate(testData, { page: 2, limit: 10 });

      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('should correctly calculate hasNext and hasPrev for last page', () => {
      const result = paginate(testData, { page: 3, limit: 10 });

      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('should calculate totalPages correctly', () => {
      expect(paginate(testData, { limit: 10 }).pagination.totalPages).toBe(3);
      expect(paginate(testData, { limit: 5 }).pagination.totalPages).toBe(5);
      expect(paginate(testData, { limit: 25 }).pagination.totalPages).toBe(1);
      expect(paginate(testData, { limit: 100 }).pagination.totalPages).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const result = paginate([], {});

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should handle array with fewer items than limit', () => {
      const smallData = [{ id: 1 }, { id: 2 }];
      const result = paginate(smallData, { limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNext).toBe(false);
    });

    it('should handle string page and limit parameters', () => {
      const result = paginate(testData, { page: '2' as any, limit: '5' as any });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.data).toHaveLength(5);
    });

    it('should handle invalid page parameter', () => {
      const result = paginate(testData, { page: NaN });

      expect(result.pagination.page).toBe(1);
    });

    it('should handle invalid limit parameter', () => {
      const result = paginate(testData, { limit: NaN });

      expect(result.pagination.limit).toBe(10);
    });
  });
});
