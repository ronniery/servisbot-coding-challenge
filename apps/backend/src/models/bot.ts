import { DataStore } from '../utils/provider/datastore';
import type { Log } from './log';
import type { Worker } from './worker';
import { Bot as IBot, BotStatus } from '@packages/shared';

export { BotStatus };

export class Bot implements IBot {
  public static datastore: DataStore;
  public readonly id: string;
  public readonly created: number;
  public name: string;
  public status: BotStatus;
  public description: string;

  constructor(obj: Partial<Bot>) {
    this.id = obj.id || '';
    this.created = obj.created || 0;
    this.name = obj.name || '';
    this.status = obj.status || BotStatus.DISABLED;
    this.description = obj.description || '';
  }

  public static find(): Bot[] {
    return Object.values(this.datastore.botsById).map((bot) => new Bot(bot));
  }

  public static findById(id: string): Bot | undefined {
    const bot = this.datastore.botsById[id];

    if (!bot) return undefined;

    return new Bot(bot);
  }

  public static getWorkers(botId: string): Worker[] {
    return Object.values(this.datastore.workersById).filter((worker) => worker.botId === botId);
  }

  public static getLogs(botId: string): Log[] {
    return Object.values(this.datastore.logsById)
      .filter((log: Log) => log.bot === botId)
      .sort((a, b) => a.created - b.created);
  }
}
