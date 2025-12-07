import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createApp } from '../src/factory';
import { Application } from '../src/application';

// Mocks
vi.mock('fs');
vi.mock('path');

describe('factory', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock environment
    process.env.API_PORT = '3000';
    process.env.HEALTH_CHECK_PORT = '3001';

    // Mock fs for DataStore
    const fs = await import('fs');
    const path = await import('path');

    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
      if (filePath.includes('bots.json')) return JSON.stringify([]);
      if (filePath.includes('workers.json')) return JSON.stringify([]);
      if (filePath.includes('logs.json')) return JSON.stringify([]);

      throw new Error(`Unexpected file path: ${filePath}`);
    });
  });

  describe('createApp', () => {
    it('should create an Application instance', async () => {
      const app = await createApp();

      expect(app).toBeDefined();
      expect(app).toBeInstanceOf(Application);
    });

    it('should initialize all dependencies', async () => {
      const app = await createApp();

      // Verify app was created successfully
      expect(app).toBeDefined();
    });

    it('should return a valid application', async () => {
      const app = await createApp();

      // Check that the app has the expected methods
      expect(app.start).toBeDefined();
      expect(typeof app.start).toBe('function');
    });
  });
});
