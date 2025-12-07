import type { DataStore } from '../utils';
import type { Log } from './log';

import { Worker as IWorker } from '@packages/shared';

export class Worker implements IWorker {
  public static datastore: DataStore;
  public readonly id: string;
  public readonly created: number;
  public readonly bot: string;
  public name: string;
  public description: string;
  public botId: string;

  constructor(obj: Partial<Worker>) {
    this.id = obj.id || '';
    this.created = obj.created || 0;
    this.bot = obj.bot || '';
    this.name = obj.name || '';
    this.description = obj.description || '';
    this.botId = obj.botId || '';
  }

  public static getLogs(workerId: string): Log[] {
    return Object.values(this.datastore.logsById)
      .filter((log: Log) => log.worker === workerId)
      .sort((prev, next) => prev.created - next.created);
  }
}
