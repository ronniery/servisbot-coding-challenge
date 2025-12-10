import type { Bot, Log, PaginatedResponse, PaginationParams, Worker } from '@packages/shared';

import { BotModel, WorkerModel } from '../models';
import { logger, paginate } from '../utils';

export class BotService {
  public constructor() {
    logger.debug('Initializing BotService');
  }

  public getAllBots(params?: PaginationParams): PaginatedResponse<Bot> {
    logger.debug('Service: Getting all bots');
    const bots = BotModel.find();

    logger.debug(`Service: Found ${bots.length} bots`);
    const paginatedBots = paginate(bots, params || {});

    logger.debug(
      `Service: Returning ${paginatedBots.data.length} of ${paginatedBots.pagination.total} bots (page ${paginatedBots.pagination.page})`,
    );
    return paginatedBots;
  }

  public getBotById(id: string): Bot | undefined {
    logger.debug(`Service: Getting bot by ID: ${id}`);
    return BotModel.findById(id);
  }

  public getWorkersByBotId(botId: string, params?: PaginationParams): PaginatedResponse<Worker> {
    logger.debug(`Service: Getting workers for bot: ${botId}`);
    const workers = BotModel.getWorkers(botId);
    const paginatedWorkers = paginate(workers, params || {});

    logger.debug(
      `Service: Returning ${paginatedWorkers.data.length} of ${paginatedWorkers.pagination.total} workers for bot ${botId} (page ${paginatedWorkers.pagination.page})`,
    );
    return paginatedWorkers;
  }

  public getBotLogs(botId: string, params?: PaginationParams): PaginatedResponse<Log> {
    logger.debug(`Service: Getting logs for bot: ${botId}`);
    const logs = BotModel.getLogs(botId);
    const paginatedLogs = paginate(logs, params || {});

    logger.debug(
      `Service: Returning ${paginatedLogs.data.length} of ${paginatedLogs.pagination.total} logs for bot ${botId} (page ${paginatedLogs.pagination.page})`,
    );
    return paginatedLogs;
  }

  public getWorkerLogs(workerId: string, params?: PaginationParams): PaginatedResponse<Log> {
    logger.debug(`Service: Getting logs for worker: ${workerId}`);
    const logs = WorkerModel.getLogs(workerId);
    const paginatedLogs = paginate(logs, params || {});

    logger.debug(
      `Service: Returning ${paginatedLogs.data.length} of ${paginatedLogs.pagination.total} logs for worker ${workerId} (page ${paginatedLogs.pagination.page})`,
    );
    return paginatedLogs;
  }
}
