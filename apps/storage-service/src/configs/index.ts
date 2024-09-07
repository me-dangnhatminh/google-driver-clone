export * from './app.config';

import appConfig, { AppConfig } from './app.config';

export type Configs = {
  app: AppConfig;
};

export const configs = [appConfig];
export default configs;
