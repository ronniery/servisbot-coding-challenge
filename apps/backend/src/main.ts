import 'dotenv/config';

import { Application } from './application';
import { createApp } from './factory';
import { logger } from './utils';

async function main(): Promise<void> {
  try {
    logger.info('Initializing process application');

    const app: Application = await createApp();
    await app.start();

    logger.info('Initialized the application process successfully');
  } catch (error) {
    logger.error(`Failed to start application: ${error}`);
    process.exit(1);
  }
}

main();
