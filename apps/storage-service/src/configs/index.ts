import { ConfigType } from '@nestjs/config';

export * from './app.config';
export * from './db.config';

import appConfig from './app.config';
import dbConfig from './db.config';

const configs = {
  app: appConfig,
  db: dbConfig,
};
const configArr = Object.values(configs);

export type Configs = {
  [K in keyof typeof configs]: ConfigType<(typeof configs)[K]>;
};
export default configArr;
