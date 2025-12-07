import type { PaginationParams, PaginatedResponse } from '../types';

import { logger, paginate, DataStore } from '../utils';
import { Bot, Worker, type Log } from '../models';

export class BotService {
  private readonly store: DataStore;
  constructor(params: { store: DataStore }) {
    logger.debug('Initializing BotService');
    this.store = params.store;
  }

  public getAllBots(params?: PaginationParams): PaginatedResponse<Bot> {
    logger.debug('Service: Getting all bots');
    const bots = Bot.find();

    logger.debug(`Service: Found ${bots.length} bots`);
    const paginatedBots = paginate(bots, params || {});

    logger.debug(
      `Service: Returning ${paginatedBots.data.length} of ${paginatedBots.pagination.total} bots (page ${paginatedBots.pagination.page})`,
    );
    return paginatedBots;
  }

  public getBotById(id: string): Bot | undefined {
    logger.debug(`Service: Getting bot by ID: ${id}`);
    return Bot.findById(id);
  }

  public getWorkersByBotId(botId: string, params?: PaginationParams): PaginatedResponse<Worker> {
    logger.debug(`Service: Getting workers for bot: ${botId}`);
    const workers = Bot.getWorkers(botId);
    const paginatedWorkers = paginate(workers, params || {});

    logger.debug(
      `Service: Returning ${paginatedWorkers.data.length} of ${paginatedWorkers.pagination.total} workers for bot ${botId} (page ${paginatedWorkers.pagination.page})`,
    );
    return paginatedWorkers;
  }

  public getBotLogs(botId: string, params?: PaginationParams): PaginatedResponse<Log> {
    logger.debug(`Service: Getting logs for bot: ${botId}`);
    const logs = Bot.getLogs(botId);
    const paginatedLogs = paginate(logs, params || {});

    logger.debug(
      `Service: Returning ${paginatedLogs.data.length} of ${paginatedLogs.pagination.total} logs for bot ${botId} (page ${paginatedLogs.pagination.page})`,
    );
    return paginatedLogs;
  }

  public getWorkerLogs(workerId: string, params?: PaginationParams): PaginatedResponse<Log> {
    logger.debug(`Service: Getting logs for worker: ${workerId}`);
    const logs = Worker.getLogs(workerId);
    const paginatedLogs = paginate(logs, params || {});

    logger.debug(
      `Service: Returning ${paginatedLogs.data.length} of ${paginatedLogs.pagination.total} logs for worker ${workerId} (page ${paginatedLogs.pagination.page})`,
    );
    return paginatedLogs;
  }
}
