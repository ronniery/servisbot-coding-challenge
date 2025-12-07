import { Application, type ApplicationConstructorParams } from './application';
import { getEnvironment, type Environment } from './configuration';
import { logger, DataStore } from './utils';
import { BotService } from './services';
import { BotController } from './controllers';
import { Bot, Log, Worker } from './models';

export async function createApp(): Promise<Application> {
  logger.info('Starting application initialization');

  logger.debug('Loading environment configuration');
  const env: Environment = getEnvironment();

  logger.debug('Initializing DataStore');
  const datastore: DataStore = new DataStore();

  logger.debug('Initializing Bot Model');
  Bot.datastore = datastore;
  Worker.datastore = datastore;
  Log.datastore = datastore;

  logger.debug('Initializing BotService');
  const service: BotService = new BotService({ store: datastore });

  logger.debug('Initializing BotController');
  const controller: BotController = new BotController({ service });

  logger.debug('Creating Application instance');
  const params: ApplicationConstructorParams = {
    env,
    datastore,
    controller,
  };

  logger.info('Application initialization complete');

  return new Application(params);
}
