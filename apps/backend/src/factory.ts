import { Application, type ApplicationConstructorParams } from './application';
import { type Environment, getEnvironment } from './configuration';
import { BotController, DocsController } from './controllers';
import { BotModel, LogModel, WorkerModel } from './models';
import { BotService } from './services';
import { DataStore, logger } from './utils';

export async function createApp(): Promise<Application> {
  logger.info('Starting application initialization');

  logger.debug('Loading environment configuration');
  const env: Environment = getEnvironment();

  logger.debug('Initializing DataStore');
  const datastore: DataStore = new DataStore();

  logger.debug('Initializing Bot Model');
  BotModel.datastore = datastore;
  WorkerModel.datastore = datastore;
  LogModel.datastore = datastore;

  logger.debug('Initializing BotService');
  const service: BotService = new BotService();

  logger.debug('Initializing Controllers');
  const botController: BotController = new BotController({ service });
  const docsController: DocsController = new DocsController();

  logger.debug('Creating Application instance');
  const params: ApplicationConstructorParams = {
    env,
    datastore,
    botController,
    docsController,
  };

  logger.info('Application initialization complete');

  return new Application(params);
}
