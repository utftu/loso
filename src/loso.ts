type Meta = {
  version: string;
  updatedTime: string | number;
  stringType: boolean;
};

type Config = {
  version: string;
  configs: Record<string, Meta>;
};

type Props = {
  version: string;
  localStorage?: Storage;
};

const configName = 'loso_config';

export class Loso {
  static configName = configName;

  static new(props: Props) {
    return new Loso(props);
  }

  private version: string;
  private localStorage: Storage;
  private getNewConfig(): Config {
    return {
      version: '0.0.1',
      configs: {},
    };
  }
  private setJSONItem(name: string, value: any) {
    this.localStorage.setItem(name, JSON.stringify(value));
  }
  private resetConfig() {
    const newConfig = this.getNewConfig();
    this.setJSONItem(configName, this.getNewConfig);
    return newConfig;
  }
  private handleConfig() {
    const oldRawConfig = this.localStorage.getItem(configName);
    if (!oldRawConfig) {
      return this.resetConfig();
    }
    try {
      const oldConfig = JSON.parse(oldRawConfig);
      if (
        typeof oldConfig !== 'object' ||
        typeof oldConfig.configs !== 'object'
      ) {
        return this.resetConfig();
      }
      return oldConfig as Config;
    } catch {
      return this.resetConfig();
    }
  }

  constructor({
    version,
    localStorage: localStorageLocal = localStorage,
  }: Props) {
    this.version = version;
    this.localStorage = localStorageLocal;
  }
  get(name: string) {
    const config = this.handleConfig();

    if (!config.configs[name]) {
      return null;
    }

    const valueRaw = this.localStorage.getItem(name);

    if (valueRaw === null) {
      delete config.configs[name];
      this.setJSONItem(configName, config);
      return valueRaw;
    }

    if (config.configs[name].stringType === true) {
      return valueRaw;
    } else {
      return JSON.parse(valueRaw);
    }
  }
  set(name: string, value: any) {
    const config = this.handleConfig();
    const stringType = typeof value === 'string';

    if (stringType === true) {
      this.localStorage.setItem(name, value);
    } else {
      this.setJSONItem(name, value);
    }

    config.configs[name] = {
      version: this.version,
      updatedTime: new Date().toISOString(),
      stringType,
    };
    this.setJSONItem(configName, config);
  }
  remove(name: string) {
    const config = this.handleConfig();

    this.localStorage.removeItem(name);
    delete config.configs[name];
    this.setJSONItem(configName, config);
  }
}
