import { DataStore } from '../utils/provider/datastore';

export class Log {
  public static datastore: DataStore;
  public readonly id: string;
  public readonly created: number;
  public readonly bot: string;
  public readonly worker: string;
  public message: string;
  public botId: string;

  constructor(obj: Partial<Log>) {
    this.id = obj.id || '';
    this.created = obj.created || 0;
    this.bot = obj.bot || '';
    this.worker = obj.worker || '';
    this.message = obj.message || '';
    this.botId = obj.botId || '';
  }

  public static find(): Log[] {
    return Object.values(this.datastore.logsById).map((log) => new Log(log));
  }
}
