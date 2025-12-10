import { IsNotEmpty, IsUrl, validateSync } from 'class-validator';

export class Environment {
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  API_BASE_URL: string;

  constructor(env: ImportMetaEnv) {
    this.API_BASE_URL = env.VITE_API_URL;
  }

  public validate(): Environment {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(errors.toString());
    }
    
    return this;
  }
}

export const getEnvironment = (): Environment => {
  return new Environment(import.meta.env).validate();
};
