import * as fs from 'fs';
import * as path from 'path';

import { Bot } from '../../models/bot';
import { Worker } from '../../models/worker';
import { Log } from '../../models/log';
import { logger } from '../logger';

export class DataStore {
  public readonly botsById: Record<string, Bot> = {};
  public readonly workersById: Record<string, Worker> = {};
  public readonly logsById: Record<string, Log> = {};

  constructor() {
    logger.info('Initializing DataStore');
    this.loadDataFiles();
  }

  public loadDataFiles(): void {
    logger.debug('Loading data files from filesystem');
    const botsPath = path.join(__dirname, 'data', 'bots.json');
    const workersPath = path.join(__dirname, 'data', 'workers.json');
    const logsPath = path.join(__dirname, 'data', 'logs.json');

    logger.debug(`Reading bots from: ${botsPath}`);
    const bots: Bot[] = JSON.parse(fs.readFileSync(botsPath, 'utf-8'));
    logger.debug(`Reading workers from: ${workersPath}`);
    const workers: Array<Worker> = JSON.parse(fs.readFileSync(workersPath, 'utf-8'));
    logger.debug(`Reading logs from: ${logsPath}`);
    const logs: Array<Log> = JSON.parse(fs.readFileSync(logsPath, 'utf-8'));

    logger.info(`Loaded ${bots.length} bots, ${workers.length} workers, ${logs.length} logs`);
    this.createStructs(bots, workers, logs);
  }

  private createStructs(bots: Bot[], workers: Array<Worker>, logs: Array<Log>): void {
    logger.debug('Creating data structures for efficient lookups');

    const botIdByName: Record<string, string> = this.crateBotStruct(bots);
    this.createWorkerStruct(workers, botIdByName);
    this.createLogStruct(logs);
    logger.debug('Data structures created successfully');
  }

  private crateBotStruct(bots: Bot[]): Record<string, string> {
    const botIdByName: Record<string, string> = {};

    // O(N)
    bots.forEach((bot: Bot) => {
      this.botsById[bot.id] = bot;

      botIdByName[bot.name] = bot.id;
    });

    return botIdByName;
  }

  private createWorkerStruct(workers: Array<Worker>, botIdByName: Record<string, string>): void {
    // O(N)
    workers.forEach((worker: Worker) => {
      const botId = botIdByName[worker.bot];

      if (botId) {
        worker.botId = botId;
      }

      this.workersById[worker.id] = worker;
    });
  }

  private createLogStruct(logs: Array<Log>): void {
    // O(N)
    logs.forEach((log: Log) => (this.logsById[log.id] = log));
  }
}
