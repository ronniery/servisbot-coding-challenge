import express, { type Request, type Response, type Router as ExpressRouter } from 'express';

import { logger } from '../utils';

export class HealthController {
  private router: ExpressRouter;
  private isShuttingDown: boolean = false;

  public constructor() {
    logger.debug('Initializing HealthController');
    this.router = express.Router();
    this.setupRoutes();
  }

  public getRouter(): ExpressRouter {
    return this.router;
  }

  public setShuttingDown(isShuttingDown: boolean): void {
    this.isShuttingDown = isShuttingDown;
  }

  private setupRoutes(): void {
    this.router.get('/', (req: Request, res: Response) => {
      this.getHealth(req, res);
    });

    this.router.get('/health', (req: Request, res: Response) => {
      this.getHealth(req, res);
    });
  }

  private getHealth(req: Request, res: Response): void {
    if (this.isShuttingDown) {
      logger.debug('Health check endpoint hit during shutdown, returning 503');
      res.status(503).send('Service Unavailable');
      return;
    }

    logger.debug('Health check endpoint hit');
    res.status(200).send('OK');
  }
}
