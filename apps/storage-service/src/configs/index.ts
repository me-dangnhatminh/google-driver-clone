export * from './app.config';

import appConfig, { AppConfig } from './app.config';
import dbConfig, { DbConfig } from './db.config';

export type Configs = {
  app: AppConfig;
  db: DbConfig;
};

export const configs = [appConfig, dbConfig];
export default configs;
