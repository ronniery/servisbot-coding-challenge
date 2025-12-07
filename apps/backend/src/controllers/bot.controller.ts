import express, { type Request, type Response, type Router as ExpressRouter } from 'express';
import Router = express;

import type { PaginatedResponse, PaginationParams } from '@packages/shared';
import { Bot, Worker, Log } from '../models';
import { BotService } from '../services';
import { logger } from '../utils';

type BotControllerParams = {
  service: BotService;
};

type BotQueryId = { bid: string };
type WorkerQueryId = { wid: string };

export class BotController {
  private readonly router: ExpressRouter;
  private readonly service: BotService;

  constructor(params: BotControllerParams) {
    logger.debug('Initializing BotController');
    this.service = params.service;
    this.router = Router();

    this.createRoutes();
  }

  public getRouter(): ExpressRouter {
    return this.router;
  }

  private createRoutes(): void {
    logger.debug('Creating bot routes');
    this.router.get('/', this.getAllBots);
    this.router.get('/:bid', this.getBotById);
    this.router.get('/:bid/workers', this.getWorkersByBot);
    this.router.get('/:bid/logs', this.getLogsByBot);
    this.router.get('/:bid/workers/:wid/logs', this.getLogsByWorker);
    logger.debug('Bot routes created');
  }

  /**
   * GET /bots?page=1&limit=10
   */
  private getAllBots = (
    req: Request<{}, {}, {}, PaginationParams>,
    res: Response<PaginatedResponse<Bot>>,
  ): void => {
    const { page, limit } = req.query;
    logger.debug(`GET /bots - Fetching all bots (page=${page || 1}, limit=${limit || 10})`);
    const pagination = this.service.getAllBots({ page, limit });

    logger.info(
      `Retrieved ${pagination.data.length} of ${pagination.pagination.total} bots (page ${pagination.pagination.page})`,
    );
    res.json(pagination);
  };

  /**
   * GET /bots/:bid
   */
  private getBotById = (req: Request<BotQueryId>, res: Response<Bot | { error: string }>): void => {
    const { bid } = req.params;
    logger.debug(`GET /bots/${bid} - Fetching bot by ID`);
    const bot = this.service.getBotById(bid);

    if (!bot) {
      logger.warn(`Bot not found: ${bid}`);
      res.status(404).json({ error: 'Bot not found' });
      return;
    }

    logger.info(`Retrieved bot: ${bid}`);
    res.json(bot);
  };

  /**
   * GET /bots/:bid/workers?page=1&limit=10
   */
  private getWorkersByBot = (
    req: Request<BotQueryId, {}, {}, PaginationParams>,
    res: Response<PaginatedResponse<Worker>>,
  ): void => {
    const { bid } = req.params;
    const { page, limit } = req.query;

    logger.debug(
      `GET /bots/${bid}/workers - Fetching workers for bot (page=${page || 1}, limit=${limit || 10})`,
    );
    const pagination = this.service.getWorkersByBotId(bid, { page, limit });

    logger.info(
      `Retrieved ${pagination.data.length} of ${pagination.pagination.total} workers for bot ${bid}`,
    );
    res.json(pagination);
  };

  /**
   * GET /bots/:bid/logs?page=1&limit=10
   */
  private getLogsByBot = (
    req: Request<BotQueryId, {}, {}, PaginationParams>,
    res: Response<PaginatedResponse<Log> | { error: string }>,
  ): void => {
    const { bid } = req.params;
    const { page, limit } = req.query;
    logger.debug(
      `GET /bots/${bid}/logs - Fetching logs for bot (page=${page || 1}, limit=${limit || 10})`,
    );
    const pagination = this.service.getBotLogs(bid, { page, limit });

    // Check if bot exists by checking if we got any results or if pagination total is 0
    if (pagination.pagination.total === 0) {
      // Verify bot exists
      const bot = this.service.getBotById(bid);

      if (!bot) {
        logger.warn(`Bot not found: ${bid}`);
        res.status(404).json({ error: 'Bot not found' });
        return;
      }
    }

    logger.info(
      `Retrieved ${pagination.data.length} of ${pagination.pagination.total} logs for bot ${bid} (page ${pagination.pagination.page})`,
    );
    res.json(pagination);
  };

  /**
   * GET /bots/:bid/workers/:wid/logs?page=1&limit=10
   */
  private getLogsByWorker = (
    req: Request<BotQueryId & WorkerQueryId, {}, {}, PaginationParams>,
    res: Response<PaginatedResponse<Log> | { error: string }>,
  ): void => {
    const { bid, wid } = req.params;
    const { page, limit } = req.query;
    logger.debug(
      `GET /bots/${bid}/workers/${wid}/logs - Fetching logs for worker (page=${page || 1}, limit=${limit || 10})`,
    );
    const pagination = this.service.getWorkerLogs(wid, { page, limit });

    logger.info(
      `Retrieved ${pagination.data.length} of ${pagination.pagination.total} logs for worker ${wid} (page ${pagination.pagination.page})`,
    );
    res.json(pagination);
  };
}
