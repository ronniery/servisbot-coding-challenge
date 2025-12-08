import { describe, it, expect, vi, beforeEach } from 'vitest';

import { BotService } from '../../src/services';
import { Bot, Worker, Log, BotStatus } from '@packages/shared';
import { DataStore } from '../../src/utils';
import { BotModel, LogModel, WorkerModel } from '../../src/models';

// Mocks
vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('bot.service', () => {
  let mockDataStore: DataStore;
  let service: BotService;

  const mockBots: Record<string, Bot> = {
    'bot-1': {
      id: 'bot-1',
      name: 'Test Bot One',
      description: 'First test bot',
      status: BotStatus.ENABLED,
      created: 1713809849892,
    } as Bot,
    'bot-2': {
      id: 'bot-2',
      name: 'Test Bot Two',
      description: 'Second test bot',
      status: BotStatus.DISABLED,
      created: 1713774119964,
    } as Bot,
  };

  const mockWorkers: Worker[] = [
    {
      id: 'worker-1',
      bot: 'Test Bot One', // Name
      botId: 'bot-1', // ID
      name: 'Worker 1-1',
      description: 'First worker for bot 1',
      created: 1713809849892,
    } as Worker,
    {
      id: 'worker-2',
      bot: 'Test Bot One',
      botId: 'bot-1',
      name: 'Worker 1-2',
      description: 'Second worker for bot 1',
      created: 1713809849893,
    } as Worker,
  ];

  const mockLogs: Log[] = Array.from({ length: 25 }, (_, i) => ({
    id: `log-${i}`,
    bot: 'bot-1',
    worker: 'worker-1',
    botId: 'bot-1',
    message: `Test log message ${i}`,
    created: 1713809849892 + i * 1000,
  } as Log));

  beforeEach(() => {
    vi.clearAllMocks();

    mockDataStore = {
      botsById: mockBots,
      workersById: mockWorkers.reduce((acc, worker) => ({ ...acc, [worker.id]: worker }), {}),
      logsById: mockLogs.reduce((acc, log) => ({ ...acc, [log.id]: log }), {}),
    } as unknown as DataStore;

    // Inject mock DataStore into Models
    BotModel.datastore = mockDataStore;
    WorkerModel.datastore = mockDataStore;
    LogModel.datastore = mockDataStore;

    service = new BotService();
  });

  describe('getAllBots', () => {
    it('should return all bots with default pagination', () => {
      const result = service.getAllBots();

      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(2);
    });

    it('should return paginated bots with custom params', () => {
      const result = service.getAllBots({ page: 1, limit: 1 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should return empty array when no bots exist', () => {
      // Clear bots
      (mockDataStore.botsById as any) = {};

      const result = service.getAllBots();

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle page beyond available data', () => {
      const result = service.getAllBots({ page: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.page).toBe(10);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('getBotById', () => {
    it('should return bot when it exists', () => {
      const bot = service.getBotById('bot-1');

      // The returned object is a Bot instance, matching props
      expect(bot?.id).toBe(mockBots?.['bot-1']?.id);
      expect(bot?.name).toBe(mockBots?.['bot-1']?.name);
    });

    it('should return undefined when bot does not exist', () => {
      const bot = service.getBotById('non-existent');

      expect(bot).toBeUndefined();
    });

    it('should return correct bot for bot-2', () => {
      const bot = service.getBotById('bot-2');

      expect(bot?.id).toBe('bot-2');
    });
  });

  describe('getWorkersByBotId', () => {
    it('should return workers for a bot with default pagination', () => {
      const result = service.getWorkersByBotId('bot-1');

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result?.data[0]?.botId).toBe('bot-1');
      expect(result?.data[1]?.botId).toBe('bot-1');
    });

    it('should respect custom pagination params', () => {
      const result = service.getWorkersByBotId('bot-1', { page: 1, limit: 1 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should return empty result when no workers exist', () => {
      // Check bot-2 which has no workers in mock data (lines 37-54 only designate bot-1)
      const result = service.getWorkersByBotId('bot-2');

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getBotLogs', () => {
    it('should return paginated logs for a bot', () => {
      const result = service.getBotLogs('bot-1');

      expect(result.data).toHaveLength(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(25);
    });

    it('should respect custom pagination params', () => {
      const result = service.getBotLogs('bot-1', { page: 2, limit: 5 });

      expect(result.data).toHaveLength(5);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });

    it('should return empty result when no logs exist', () => {
      const result = service.getBotLogs('bot-2');

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle last page with fewer items', () => {
      const result = service.getBotLogs('bot-1', { page: 3, limit: 10 });

      expect(result.data).toHaveLength(5);
      expect(result.pagination.hasNext).toBe(false);
    });
  });

  describe('getWorkerLogs', () => {
    it('should return paginated logs for a worker', () => {
      const result = service.getWorkerLogs('worker-1');

      expect(result.data).toHaveLength(10);
      expect(result.pagination.total).toBe(25);
    });

    it('should respect custom pagination params', () => {
      const result = service.getWorkerLogs('worker-1', { page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.totalPages).toBe(Math.ceil(25 / 2));
    });

    it('should return empty result when no logs exist', () => {
      const result = service.getWorkerLogs('worker-2'); // No logs for worker-2 in mock data?
      // Line 59 defines worker as 'worker-1' for ALL.

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });
});
