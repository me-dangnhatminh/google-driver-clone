import * as path from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import { Logger } from '@nestjs/common';
import validateConfig, { ConfigDeepPartial } from './config.schema';

const CONFIG_FILE = 'app-config.yaml';

export default () => {
  const fileConfigPath = path.resolve(__dirname, '../config', CONFIG_FILE);

  const fileConfig = loadFileConfig(fileConfigPath);
  const envConfig = envToConfig(process.env);

  const config = Object.assign({}, envConfig, fileConfig);
  return validateConfig(config);
};

const loadFileConfig = (configPath: string): unknown => {
  const exits = fs.existsSync(configPath);

  const replaceEnv = (template: string, env: NodeJS.ProcessEnv) => {
    const missing: string[] = [];
    const passed: string[] = [];
    const replaceRegex = /\${(\w+)}/g;
    const replaced = template.replace(replaceRegex, (_, key) => {
      if (env[key] === undefined) missing.push(key);
      else passed.push(key);
      return env[key] ?? '';
    });
    return { replaced, missing, passed };
  };

  if (!exits) {
    Logger.warn(`Config file not found: ${configPath}`, 'ConfigModule');
    return {};
  }
  const content = fs.readFileSync(configPath, 'utf8');
  const template = replaceEnv(content, process.env);
  return yaml.load(template.replaced);
};

const envToConfig = (env): ConfigDeepPartial => ({
  app: {
    nodeEnv: env.NODE_ENV || 'development',
    name: env.APP_NAME || 'App',
    port: env.PORT || 3000,
    host: env.HOST || 'localhost',
  },
  services: {
    minio: {
      endPoint: env.MINIO_END_POINT || 'localhost',
      port: env.MINIO_PORT || 9000,
      useSSL: env.MINIO_USE_SSL || false,
      accessKey: env.MINIO_ACCESS_KEY || 'minio',
      secretKey: env.MINIO_SECRET_KEY || 'minio123',
    },
  },
  log: {
    enabled: env.LOG_ENABLED,
    level: env.LOG_LEVEL,
    accessFile: env.LOG_ACCESS_FILE,
    filePath: env.LOG_FILE_PATH,
  },
  db: {
    type: env.DB_TYPE,
    port: env.DB_PORT,
    host: env.DB_HOST,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  },
  swagger: {
    enabled: env.SWAGGER_ENABLED,
    title: env.SWAGGER_TITLE,
    description: env.SWAGGER_DESCRIPTION,
    version: env.SWAGGER_VERSION,
    prefix: env.SWAGGER_PREFIX,
    gateway: env.SWAGGER_GATEWAY,
  },
  auth: {
    strict: env.AUTH_STRICT,
    headers: {
      userId: env.AUTH_HEADER_USER_ID,
      anonymous: env.AUTH_HEADER_ANONYMOUS,
      strict: env.AUTH_HEADER_STRICT,
      roles: env.AUTH_HEADER_ROLES,
      permissions: env.AUTH_HEADER_PERMISSIONS,
    },
  },
  cache: {
    use: env.CACHE_USE,
    redis: {
      url: env.CACHE_REDIS_URL,
      password: env.CACHE_REDIS_PASSWORD,
      username: env.CACHE_REDIS_USERNAME,
    },
  },
  rabbitmq: {
    url: env.RABBITMQ_URL,
    user: env.RABBITMQ_USER,
    password: env.RABBITMQ_PASSWORD,
  },
});
