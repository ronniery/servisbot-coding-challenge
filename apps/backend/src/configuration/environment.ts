import { IsNotEmpty, IsNumber, IsOptional, validateSync } from 'class-validator';

import { logger } from '../utils/logger';

export class Environment {
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  API_PORT?: number = 3001;

  constructor(env: Record<string, any>) {
    this.API_PORT = Number(env.API_PORT);
  }

  validate() {
    const errors = validateSync(this, { skipMissingProperties: true });
    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return this;
  }
}

export const getEnvironment: () => Environment = (): Environment => {
  logger.debug('Loading environment variables');

  return new Environment(process.env).validate();
};
