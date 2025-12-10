import { IsNotEmpty, IsNumber, IsOptional, validateSync } from 'class-validator';

import { logger } from '../utils/logger';

export class Environment {
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  public readonly API_PORT: number;

  constructor(env: Record<string, any>) {
    this.API_PORT = env.API_PORT ? Number(env.API_PORT) : 3001;
  }

  public validate(): Environment {
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
