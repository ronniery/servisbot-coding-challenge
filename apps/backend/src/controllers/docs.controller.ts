import express, { type Request, type Response, type Router as ExpressRouter } from 'express';
import swaggerUi from 'swagger-ui-express';
import Router = express;

import docs from '../configuration/swagger.json';

export class DocsController {
  private readonly router: ExpressRouter;

  constructor() {
    // logger.debug('Initializing DocsController'); // This line will now cause an error due to logger removal
    this.router = Router();
    this.createRoutes();
  }

  public getRouter(): ExpressRouter {
    return this.router;
  }

  private createRoutes(): void {
    this.router.get('/', swaggerUi.serve, swaggerUi.setup(docs));
    this.router.get('/docs', (_req: Request, res: Response) => {
      res.redirect('/');
    });

    this.router.get('/json', (_req: Request, res: Response) => {
      res.json(docs);
    });
  }
}
