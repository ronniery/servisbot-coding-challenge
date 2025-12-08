import express, { type Express, type Request, type Response } from 'express';
import type { Server } from 'http';
import cors from 'cors';
import morgan from 'morgan';

import { type Environment } from './configuration';
import { type DataStore, logger } from './utils';
import { type BotController, type DocsController } from './controllers';
import { notFound, generalErrors } from './middlewares';

export type ApplicationConstructorParams = {
  env: Environment;
  datastore: DataStore;
  botController: BotController;
  docsController: DocsController;
};

export class Application {
  private env: Environment;
  private botController: BotController;
  private docsController: DocsController;
  private apiServer?: Server;
  private healthServer?: Server;
  private isShuttingDown = false;

  constructor(params: ApplicationConstructorParams) {
    this.env = params.env;
    this.botController = params.botController;
    this.docsController = params.docsController;
    this.setupGracefulShutdown();
  }

  public async start(): Promise<void> {
    await this.startHealthServer();
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

    if (this.healthServer) {
      shutdownPromises.push(
        new Promise<void>((resolve) => {
          logger.debug('Closing health check server...');

          this.healthServer!.close(() => {
            logger.info('Health check server closed');
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

    logger.debug('Registering bot controller routes at /');
    app.use('/bots', this.botController.getRouter());

    logger.debug('Registering docs controller routes');
    app.use('/docs', this.docsController.getRouter());

    // Error handling middlewares
    app.use(notFound);
    app.use(generalErrors);

    this.apiServer = app.listen(this.env.API_PORT, (): void => {
      logger.info(`API server started on port ${this.env.API_PORT}`);
    });
  }

  private async startHealthServer(): Promise<void> {
    logger.info('Starting health check server...');
    const app: Express = express();

    app.all('/health', (_: Request, res: Response): void => {
      if (this.isShuttingDown) {
        logger.debug('Health check endpoint hit during shutdown, returning 503');
        res.status(503).send('Service Unavailable');
        return;
      }

      logger.debug('Health check endpoint hit');
      res.status(200).send('OK');
    });

    app.get('/', (_: Request, res: Response): void => {
      logger.debug('Root endpoint hit, redirecting to /health');
      res.redirect('/health');
    });

    // catch-all unmatched routes
    app.use((_: Request, res: Response): void => {
      logger.debug('Unknown endpoint hit, redirecting to /health');
      res.redirect('/health');
    });

    this.healthServer = app.listen(this.env.HEALTH_CHECK_PORT, (): void => {
      logger.info(`Health check server started on port ${this.env.HEALTH_CHECK_PORT}`);
    });
  }
}
