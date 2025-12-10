import * as fs from 'fs';
import * as path from 'path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { Bot, Log, PaginationMeta, Worker } from '@packages/shared';

import { Application } from '../src/application';
import { createApp } from '../src/factory';

// Mocks
vi.mock('fs');
vi.mock('path');

describe('application.integration', () => {
  let app: Application;
  let apiPort: number;
  let healthPort: number;

  const mockBots = [
    {
      id: 'bot-1',
      name: 'Integration Test Bot One',
      description: 'First integration test bot',
      status: 'ENABLED',
      created: 1713809849892,
    },
    {
      id: 'bot-2',
      name: 'Integration Test Bot Two',
      description: 'Second integration test bot',
      status: 'DISABLED',
      created: 1713774119964,
    },
    {
      id: 'bot-3',
      name: 'Integration Test Bot Three',
      description: 'Third integration test bot',
      status: 'PAUSED',
      created: 1713762074682,
    },
  ];

  const mockWorkers = [
    {
      id: 'worker-1',
      bot: 'Integration Test Bot One',
      name: 'Worker 1-1',
      description: 'First worker for bot 1',
      created: 1713809849892,
    },
    {
      id: 'worker-2',
      bot: 'Integration Test Bot One',
      name: 'Worker 1-2',
      description: 'Second worker for bot 1',
      created: 1713809849893,
    },
    {
      id: 'worker-3',
      bot: 'Integration Test Bot Two',
      name: 'Worker 2-1',
      description: 'First worker for bot 2',
      created: 1713774119964,
    },
  ];

  const mockLogs = Array.from({ length: 50 }, (_, i) => ({
    id: `log-${i}`,
    bot: i < 30 ? 'bot-1' : 'bot-2',
    worker: i < 20 ? 'worker-1' : i < 30 ? 'worker-2' : 'worker-3',
    message: `Integration test log message ${i}`,
    created: new Date(1713809849892 + i * 1000).toISOString(),
  }));

  beforeAll(async () => {
    // Setup mock file system
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
      if (filePath.includes('bots.json')) return JSON.stringify(mockBots);
      if (filePath.includes('workers.json')) return JSON.stringify(mockWorkers);
      if (filePath.includes('logs.json')) return JSON.stringify(mockLogs);

      throw new Error(`Unexpected file path: ${filePath}`);
    });

    // Setup environment
    apiPort = 9000 + Math.floor(Math.random() * 1000);
    healthPort = apiPort + 1;
    process.env.API_PORT = String(apiPort);
    process.env.HEALTH_CHECK_PORT = String(healthPort);

    // Create and start application
    app = await createApp();
    await app.start();

    // Wait a bit for servers to be ready
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    if (app) {
      const ref = app as any;
      if (ref.apiServer) {
        await new Promise<void>((resolve) => {
          ref.apiServer.close(() => resolve());
        });
      }

      if (ref.healthServer) {
        await new Promise<void>((resolve) => {
          ref.healthServer.close(() => resolve());
        });
      }
    }
  });

  describe('Health Check Server', () => {
    it('should respond to /health endpoint', async () => {
      const response = await fetch(`http://localhost:${apiPort}/health`);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('OK');
    });

    it('should return 200 OK on root', async () => {
      const response = await fetch(`http://localhost:${apiPort}/`);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('OK');
    });

    it('should return 404 on unknown routes', async () => {
      const response = await fetch(`http://localhost:${apiPort}/unknown`);

      expect(response.status).toBe(404);
    });

    it('should return 503 when shutting down', async () => {
      const ref = app as any;
      ref.isShuttingDown = true;
      ref.healthController.setShuttingDown(true);

      const response = await fetch(`http://localhost:${apiPort}/health`);

      expect(response.status).toBe(503);
      expect(await response.text()).toBe('Service Unavailable');

      ref.isShuttingDown = false;
      ref.healthController.setShuttingDown(false);
    });
  });

  describe('API Server - GET /', () => {
    it('should return paginated bots with default params', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots`);
      const data = await response.json<{ data: Bot[]; pagination: PaginationMeta }>();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(3);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.total).toBe(3);
    });

    it('should respect page parameter', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots?page=2&limit=2`);
      const data = await response.json<{ data: Bot[]; pagination: PaginationMeta }>();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(2);
    });

    it('should include CORS headers', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots`);

      expect(response.headers.get('access-control-allow-origin')).toBeDefined();
    });
  });

  describe('API Server - GET /:id', () => {
    it('should return bot by ID', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots/bot-1`);
      const data = await response.json<Bot>();

      expect(response.status).toBe(200);
      expect(data.id).toBe('bot-1');
      expect(data.name).toBe('Integration Test Bot One');
    });

    it('should return 404 for non-existent bot', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots/non-existent-bot`);
      const data = await response.json<{ error: string }>();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Bot not found');
    });
  });

  describe('API Server - GET /:id/workers', () => {
    it('should return paginated workers for a bot', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots/bot-1/workers`);
      const data = await response.json<{ data: Worker[]; pagination: PaginationMeta }>();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
      expect(data.data?.[0]?.id).toBe('worker-1');
    });

    it('should respect pagination params for workers', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots/bot-1/workers?page=1&limit=1`);
      const data = await response.json<{ data: Worker[]; pagination: PaginationMeta }>();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.pagination.limit).toBe(1);
      expect(data.pagination.totalPages).toBe(2);
    });

    it('should return empty paginated result for bot with no workers', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots/bot-3/workers`);
      const data = await response.json<{ data: Worker[]; pagination: PaginationMeta }>();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe('API Server - GET /:id/logs', () => {
    it('should return paginated logs for a bot', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots/bot-1/logs`);
      const data = await response.json<{ data: Log[]; pagination: PaginationMeta }>();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(10);
      expect(data.pagination.total).toBe(30);
      expect(data.data.every((log: any) => log.bot === 'bot-1')).toBe(true);
    });

    it('should respect pagination params', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots/bot-1/logs?page=2&limit=5`);
      const data = await response.json<{ data: Log[]; pagination: PaginationMeta }>();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(5);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(5);
    });

    it('should return 404 for non-existent bot with no logs', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots/non-existent/logs`);
      const data = await response.json<{ error: string }>();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Bot not found');
    });
  });

  describe('API Server - GET /:id/workers/:wid/logs', () => {
    it('should return paginated logs for a worker', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots/bot-1/workers/worker-1/logs`);
      const data = await response.json<{ data: Log[]; pagination: PaginationMeta }>();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(10);
      expect(data.pagination.total).toBe(20);
      expect(data.data.every((log: any) => log.worker === 'worker-1')).toBe(true);
    });

    it('should respect pagination params', async () => {
      const response = await fetch(
        `http://localhost:${apiPort}/bots/bot-1/workers/worker-1/logs?page=1&limit=15`,
      );
      const data = await response.json<{ data: Log[]; pagination: PaginationMeta }>();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(15);
      expect(data.pagination.limit).toBe(15);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await fetch(
        `http://localhost:${apiPort}/bots/this-is-definitely-not-a-valid-bot-id-12345`,
      );
      const data = await response.json<{ error: string }>();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Bot not found');
    });

    it('should include path in 404 response', async () => {
      const response = await fetch(`http://localhost:${apiPort}/some/random/path`);
      const data = await response.json<{ error: string; path: string }>();

      expect(response.status).toBe(404);
      expect(data.path).toBe('/some/random/path');
    });
  });

  describe('Response Headers', () => {
    it('should include CORS headers in all responses', async () => {
      const response = await fetch(`http://localhost:${apiPort}/bots`);

      expect(response.headers.get('access-control-allow-origin')).toBeDefined();
    });
  });
});
