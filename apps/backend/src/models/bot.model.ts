import { Bot, Log, Worker } from '@packages/shared';

import { DataStore } from '../utils/provider/datastore';

export class BotModel {
  public static datastore: DataStore;

  public static find(): Bot[] {
    return Object.values(this.datastore.botsById);
  }

  public static findById(id: string): Bot | undefined {
    const bot = this.datastore.botsById[id];

    if (!bot) return undefined;

    return bot;
  }

  public static getWorkers(botId: string): Worker[] {
    return Object.values(this.datastore.workersById).filter((worker) => worker.botId === botId);
  }

  public static getLogs(botId: string): Log[] {
    const logs = Object.values(this.datastore.logsById);
    const logByBot = logs.filter((log: Log) => log.bot === botId);

    return logByBot.sort((prev: Log, next: Log) => prev.created - next.created);
  }
}
