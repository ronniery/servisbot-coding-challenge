import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import type { Server } from 'http';
import morgan from 'morgan';

import { type Environment } from './configuration';
import { type BotController, type DocsController, type HealthController } from './controllers';
import { generalErrors, notFound } from './middlewares';
import { type DataStore, logger } from './utils';

export type ApplicationConstructorParams = {
  env: Environment;
  datastore: DataStore;
  botController: BotController;
  docsController: DocsController;
  healthController: HealthController;
};

export class Application {
  private env: Environment;
  private botController: BotController;
  private docsController: DocsController;
  private healthController: HealthController;
  private apiServer?: Server;
  private isShuttingDown = false;

  constructor(params: ApplicationConstructorParams) {
    this.env = params.env;
    this.botController = params.botController;
    this.docsController = params.docsController;
    this.healthController = params.healthController;
    this.setupGracefulShutdown();
  }

  public async start(): Promise<void> {
    await this.startApiServer();
  }

  private setupGracefulShutdown(): void {
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        if (this.isShuttingDown) {
          logger.warn(`${signal} received again, forcing shutdown`);
          process.exit(1);
        }

        logger.info(`${signal} received, starting graceful shutdown`);
        this.isShuttingDown = true;
        this.healthController.setShuttingDown(true);

        await this.shutdown();
      });
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error(`Uncaught exception: ${error.message}`, { stack: error.stack });
      this.shutdown().then(() => process.exit(1));
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error(`Unhandled rejection: ${reason}`);
      this.shutdown().then(() => process.exit(1));
    });
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down servers...');

    const shutdownPromises: Promise<void>[] = [];

    if (this.apiServer) {
      shutdownPromises.push(
        new Promise<void>((resolve) => {
          logger.debug('Closing API server...');

          this.apiServer!.close(() => {
            logger.info('API server closed');
            resolve();
          });
        }),
      );
    }

    await Promise.all(shutdownPromises);
    logger.info('Graceful shutdown complete');
    process.exit(0);
  }

  private async startApiServer(): Promise<void> {
    logger.info('Starting API server...');
    const app: Express = express();

    const formatter =
      ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
    app.use(
      morgan(formatter, {
        stream: {
          write: (message: string) => {
            logger.info(message.trim());
          },
        },
      }),
    );
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    logger.debug('Registering health controller routes');
    app.use('/', this.healthController.getRouter());

    logger.debug('Registering bot controller routes at /bots');
    app.use('/bots', this.botController.getRouter());

    logger.debug('Registering docs controller routes at /docs');
    app.use('/docs', this.docsController.getRouter());

    logger.debug('Registering health controller routes at /health');
    app.use('/health', this.healthController.getRouter());

    // Error handling middlewares
    app.use(notFound);
    app.use(generalErrors);

    this.apiServer = app.listen(this.env.API_PORT, (): void => {
      logger.info(`API server started on port ${this.env.API_PORT}`);
    });
  }
}
