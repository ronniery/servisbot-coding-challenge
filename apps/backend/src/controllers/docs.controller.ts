import swaggerUi from 'swagger-ui-express';
import express, { type Request, type Response, type Router as ExpressRouter } from 'express';
import Router = express;

import docs from '../configuration/swagger.json';
import { logger } from '../utils';

export class DocsController {
  private readonly router: ExpressRouter;

  constructor() {
    logger.debug('Initializing DocsController');
    this.router = Router();
    this.createRoutes();
  }

  public getRouter(): ExpressRouter {
    return this.router;
  }

  private createRoutes(): void {
    logger.debug('Creating documentation routes');

    this.router.get('/', (_: Request, res: Response) => swaggerUi.serve, swaggerUi.setup(docs));
    this.router.get('/docs', (_: Request, res: Response) => {
      logger.debug('Redirecting /docs to /doc');
      res.redirect('/');
    });

    this.router.get('/json', (_: Request, res: Response) => {
      logger.debug('Redirecting /json to /doc');
      res.json(docs);
    });

    logger.debug('Documentation routes created');
  }
}
