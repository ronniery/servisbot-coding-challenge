import * as fs from 'node:fs';
import * as path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataStore } from '../../../src/utils';

// Mocks
vi.mock('fs');
vi.mock('path');

describe('datastore', () => {
  const mockBots = [
    {
      id: 'bot-1',
      name: 'Test Bot One',
      description: 'First test bot',
      status: 'ENABLED',
      created: 1713809849892,
    },
    {
      id: 'bot-2',
      name: 'Test Bot Two',
      description: 'Second test bot',
      status: 'DISABLED',
      created: 1713774119964,
    },
  ];

  const mockWorkers = [
    {
      id: 'worker-1',
      bot: 'Test Bot One',
      name: 'Worker 1-1',
      description: 'First worker for bot 1',
      created: 1713809849892,
    },
    {
      id: 'worker-2',
      bot: 'Test Bot One',
      name: 'Worker 1-2',
      description: 'Second worker for bot 1',
      created: 1713809849893,
    },
    {
      id: 'worker-3',
      bot: 'Test Bot Two',
      name: 'Worker 2-1',
      description: 'First worker for bot 2',
      created: 1713774119964,
    },
  ];

  const mockLogs = [
    {
      id: 'log-1',
      bot: 'bot-1',
      worker: 'worker-1',
      message: 'Test log message 1',
      created: '2024-04-22T10:00:00Z',
    },
    {
      id: 'log-2',
      bot: 'bot-1',
      worker: 'worker-1',
      message: 'Test log message 2',
      created: '2024-04-22T10:01:00Z',
    },
    {
      id: 'log-3',
      bot: 'bot-1',
      worker: 'worker-2',
      message: 'Test log message 3',
      created: '2024-04-22T10:02:00Z',
    },
    {
      id: 'log-4',
      bot: 'bot-2',
      worker: 'worker-3',
      message: 'Test log message 4',
      created: '2024-04-22T10:03:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock path.join to return predictable paths
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

    // Mock fs.readFileSync to return test data
    vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
      if (filePath.includes('bots.json')) {
        return JSON.stringify(mockBots);
      }
      if (filePath.includes('workers.json')) {
        return JSON.stringify(mockWorkers);
      }
      if (filePath.includes('logs.json')) {
        return JSON.stringify(mockLogs);
      }
      throw new Error(`Unexpected file path: ${filePath}`);
    });
  });

  describe('initialization', () => {
    it('should load data files on construction', () => {
      new DataStore();

      expect(fs.readFileSync).toHaveBeenCalledTimes(3);
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('bots.json'), 'utf-8');
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('workers.json'),
        'utf-8',
      );
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('logs.json'), 'utf-8');
    });

    it('should create data structures correctly', () => {
      const store = new DataStore();

      expect(Object.keys(store.botsById)).toHaveLength(2);
      expect(store.botsById['bot-1']).toBeDefined();
      expect(store.botsById['bot-2']).toBeDefined();
    });
  });

  describe('botsById', () => {
    it('should return all bots indexed by ID', () => {
      const store = new DataStore();

      expect(store.botsById?.['bot-1']?.name).toBe(mockBots[0]?.name);
      expect(store.botsById?.['bot-2']?.name).toBe(mockBots[1]?.name);
    });
  });

  describe('workersById', () => {
    it('should index workers and populate botId', () => {
      const store = new DataStore();

      const w1 = store.workersById['worker-1'];
      expect(w1).toBeDefined();
      expect(w1?.botId).toBe('bot-1'); // DataStore logic populates this mapping name->ID

      const w3 = store.workersById['worker-3'];
      expect(w3?.botId).toBe('bot-2');
    });
  });

  describe('logsById', () => {
    it('should index logs', () => {
      const store = new DataStore();

      expect(store.logsById['log-1']).toBeDefined();
      expect(store.logsById['log-4']).toBeDefined();
      expect(store.logsById['log-1']?.message).toBe(mockLogs[0]?.message);
    });
  });

  describe('edge cases', () => {
    it('should handle worker with invalid bot name', () => {
      const invalidWorkers = [
        {
          id: 'worker-invalid',
          bot: 'Non-Existent Bot', // Name doesn't match any bot
          name: 'Invalid Worker',
          description: 'Worker with invalid bot',
          created: 1713809849892,
        },
      ];

      vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
        if (filePath.includes('bots.json')) return JSON.stringify(mockBots);
        if (filePath.includes('workers.json')) return JSON.stringify(invalidWorkers);
        if (filePath.includes('logs.json')) return JSON.stringify([]);
        throw new Error(`Unexpected file path: ${filePath}`);
      });

      const store = new DataStore();
      const worker = store.workersById['worker-invalid'];

      expect(worker).toBeDefined();
      expect(worker?.botId).toBeUndefined(); // botId should not be set if mapping fails
    });

    it('should handle empty data files', () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => JSON.stringify([]));

      const store = new DataStore();

      expect(store.botsById).toEqual({});
      expect(store.workersById).toEqual({});
      expect(store.logsById).toEqual({});
    });
  });
});
