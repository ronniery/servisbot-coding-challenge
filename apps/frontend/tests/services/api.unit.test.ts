import { describe, expect,it } from 'vitest';

import { apiClient } from '@/services/api';

describe('API Service', () => {
  it('should be structured correctly', () => {
    // Useless right? Maybe...
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults.baseURL).toBe('http://localhost:3000');
  });
});
