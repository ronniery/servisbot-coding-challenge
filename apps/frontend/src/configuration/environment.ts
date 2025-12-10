export class Environment {
  API_BASE_URL: string;

  constructor(env: ImportMetaEnv) {
    this.API_BASE_URL = env.VITE_API_URL;
  }

  public validate(): Environment {
    if (!this.API_BASE_URL) {
      throw new Error("API_BASE_URL is missing");
    }

    return this;
  }
}

export const getEnvironment = (): Environment => {
  return new Environment(import.meta.env).validate();
};
