import z from 'zod';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

import { GrpcConfig } from './grpc.config';
import { Logger } from '@nestjs/common';

export type AppConfig = z.infer<typeof appConfigSchema>;
export type DbConfig = z.infer<typeof dbConfigSchema>;
export type SwaggerConfig = z.infer<typeof swaggerConfigSchema>;
export type AuthConfig = z.infer<typeof authConfigSchema>;
export type Config = z.infer<typeof configSchema> & {
  grpc: GrpcConfig;
};

export const appConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().int().default(3000),
  host: z.string().default('localhost'),
});

export const logConfigSchema = z.object({
  enabled: z.coerce.boolean().default(true),
  level: z
    .enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly'])
    .default('info'),
  accessFile: z.coerce.boolean().default(true),
  filePath: z.string().default('logs/%DATE%.error.log'),
});

export const dbConfigSchema = z.object({
  type: z.string().default('postgresql'),
  port: z.coerce.number().default(5432),
  host: z.string().default('localhost'),
  username: z.string().default('postgres'),
  password: z.string().default('postgres'),
  database: z.string().default('postgres'),
});

export const authConfigSchema = z.object({
  strict: z.boolean().default(false),
  headers: z
    .object({
      userId: z.string().default('x-user-id'),
      anonymous: z.string().default('x-anonymous'),
      strict: z.string().default('x-strict'),
      roles: z.string().default('x-user-roles'),
      permissions: z.string().default('x-user-permissions'),
    })
    .default({}),
});

export const swaggerConfigSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().default('NestJS API'),
  description: z.string().default('API description'),
  version: z.string().default('1.0'),
  prefix: z.string().default('docs'),
  gateway: z.string().default('http://localhost'),
});

export const cacheConfigSchema = z.object({
  use: z.enum(['redis', 'memory']).default('memory'),
  redis: z
    .object({
      url: z.string().default('redis://localhost:6379'),
      password: z.string().optional(),
      username: z.string().optional(),
    })
    .default({}),
});

export const rabbitmqConfigSchema = z.object({
  url: z.string().default('amqp://localhost:5672'),
  user: z.string().default('guest'),
  password: z.string().default('guest'),
});

export const configSchema = z.object({
  app: appConfigSchema.default({}),
  log: logConfigSchema.default({}),
  db: dbConfigSchema.default({}),
  swagger: swaggerConfigSchema.default({}),
  auth: authConfigSchema.default({}),
  cache: cacheConfigSchema.default({}),
  rabbitmq: rabbitmqConfigSchema.default({}),
});

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

const CONFIG_FOLDER = '../config';
const CONFIG_FILE = 'app-config.yaml';

export default () => {
  const configPath = path.resolve(__dirname, CONFIG_FOLDER, CONFIG_FILE);
  const exits = fs.existsSync(configPath);

  let config: any;
  if (!exits) {
    Logger.warn(`Config file not found: ${configPath}`, 'ConfigModule');
  } else {
    const content = fs.readFileSync(configPath, 'utf8');
    const template = replaceEnv(content, process.env);
    config = yaml.load(template.replaced);
  }

  const valid = configSchema.default({}).safeParse(config);
  if (valid.success) {
    Logger.log(
      { message: 'Configuration loaded', config: valid.data },
      'ConfigModule',
    );
    return valid.data;
  }
  const msg = valid.error.errors
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
  throw new Error(`Invalid configuration: ${msg}`);
};
