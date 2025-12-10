import { beforeEach,describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/services/api';
import { BotService } from '@/services/bot.service';

vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('BotService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBots', () => {
    it('fetches bots with default parameters', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: {} },
      });

      await BotService.getBots();

      expect(apiClient.get).toHaveBeenCalledWith('/bots', {
        params: { page: 1, limit: 10 },
      });
    });

    it('fetches bots with custom parameters', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: {} },
      });

      await BotService.getBots({ page: 2, limit: 20 });

      expect(apiClient.get).toHaveBeenCalledWith('/bots', {
        params: { page: 2, limit: 20 },
      });
    });
  });

  describe('getWorkers', () => {
    it('fetches workers for a bot', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: {} },
      });

      await BotService.getWorkers('bot-1');

      expect(apiClient.get).toHaveBeenCalledWith('/bots/bot-1/workers', {
        params: { page: 1, limit: 10 },
      });
    });
  });

  describe('getLogs', () => {
    it('fetches logs for a worker', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [], pagination: {} },
      });

      await BotService.getLogs('bot-1', 'worker-1');

      expect(apiClient.get).toHaveBeenCalledWith('/bots/bot-1/workers/worker-1/logs', {
        params: { page: 1, limit: 10 },
      });
    });
  });
});
