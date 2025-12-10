import { describe, expect, it, vi } from 'vitest';

vi.mock('@/configuration', () => ({
  getEnvironment: () => ({
    API_BASE_URL: 'http://mock-api.test',
  }),
}));

import { apiClient } from '@/services/api';

describe('API Service', () => {
  it('should be structured correctly', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults.baseURL).toBe('http://mock-api.test');
  });
});
