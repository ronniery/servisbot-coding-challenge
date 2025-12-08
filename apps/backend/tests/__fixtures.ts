import type { Bot, Log, Worker } from "@packages/shared";

export const TEST_BOTS: Bot[] = [
  {
    id: 'bot-1',
    name: 'Test Bot One',
    description: 'First test bot',
    status: 'ENABLED' as any,
    created: 1713809849892,
  },
  {
    id: 'bot-2',
    name: 'Test Bot Two',
    description: 'Second test bot',
    status: 'DISABLED' as any,
    created: 1713774119964,
  },
  {
    id: 'bot-3',
    name: 'Test Bot Three',
    description: 'Third test bot',
    status: 'PAUSED' as any,
    created: 1713762074682,
  },
];

export const TEST_WORKERS: Worker[] = [
  {
    id: 'worker-1',
    bot: 'Test Bot One',
    botId: 'bot-1',
    name: 'Worker 1-1',
    description: 'First worker for bot 1',
    created: 1713809849892,
  },
  {
    id: 'worker-2',
    bot: 'Test Bot One',
    botId: 'bot-1',
    name: 'Worker 1-2',
    description: 'Second worker for bot 1',
    created: 1713809849893,
  },
  {
    id: 'worker-3',
    bot: 'Test Bot Two',
    botId: 'bot-2',
    name: 'Worker 2-1',
    description: 'First worker for bot 2',
    created: 1713774119964,
  },
];

export const TEST_LOGS: Log[] = [
  {
    id: 'log-1',
    bot: 'bot-1',
    worker: 'worker-1',
    botId: 'bot-1',
    message: 'Test log message 1',
    created: new Date('2024-04-22T10:00:00Z').getTime(),
  },
  {
    id: 'log-2',
    bot: 'bot-1',
    worker: 'worker-1',
    botId: 'bot-1',
    message: 'Test log message 2',
    created: new Date('2024-04-22T10:01:00Z').getTime(),
  },
  {
    id: 'log-3',
    bot: 'bot-1',
    worker: 'worker-2',
    botId: 'bot-1',
    message: 'Test log message 3',
    created: new Date('2024-04-22T10:02:00Z').getTime(),
  },
  {
    id: 'log-4',
    bot: 'bot-2',
    worker: 'worker-3',
    botId: 'bot-2',
    message: 'Test log message 4',
    created: new Date('2024-04-22T10:03:00Z').getTime(),
  },
];

/**
 * Create a set of test logs for pagination testing
 */
export function createTestLogs(count: number, botId: string, workerId: string): Log[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `log-${botId}-${workerId}-${i}`,
    bot: botId,
    worker: workerId,
    botId,
    message: `Test log message ${i}`,
    created: 1713809849892 + i * 1000,
  }));
}
