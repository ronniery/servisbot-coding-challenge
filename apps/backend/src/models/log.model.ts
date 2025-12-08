import type { Log } from '@packages/shared';

import { DataStore } from '../utils/provider/datastore';

export class LogModel {
  public static datastore: DataStore;

  public static find(): Log[] {
    return Object.values(this.datastore.logsById);
  }
}
