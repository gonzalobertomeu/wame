export class Config {
  private static instance: Config | null;
  private static getInstance() {
    if (Config.instance == null) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
  private envs: Record<string, unknown>;
  private constructor() {
    this.envs = {
      port: Number(process.env.PORT) ?? 3000,
    };
  }
  private get<T>(key: string): T {
    if (!this.envs[key]) throw new Error(`${key} not exists in config`);
    const env = this.envs[key];
    return env as T;
  }
  public static get<T>(key: string) {
    return Config.getInstance().get<T>(key);
  }
}
