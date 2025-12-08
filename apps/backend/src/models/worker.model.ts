import type { Log } from '@packages/shared';

import type { DataStore } from '../utils';

export class WorkerModel {
  public static datastore: DataStore;

  public static getLogs(workerId: string): Log[] {
    const logs = Object.values(this.datastore.logsById);
    const workerLogs = logs.filter((log: Log) => log.worker === workerId);

    return workerLogs.sort((prev, next) => prev.created - next.created);
  }
}
