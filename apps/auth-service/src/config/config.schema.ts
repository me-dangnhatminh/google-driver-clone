import z from 'zod';

import { GrpcConfig } from './grpc.config';

export type AppConfig = z.infer<typeof appConfigSchema>;
export type DbConfig = z.infer<typeof dbConfigSchema>;
export type SwaggerConfig = z.infer<typeof swaggerConfigSchema>;
export type AuthConfig = z.infer<typeof authConfigSchema>;
export type Config = z.infer<typeof configSchema> & {
  grpc: GrpcConfig;
};
export type ConfigDeepPartial<T = Config> = {
  [K in keyof T]?: T[K] extends object ? ConfigDeepPartial<T[K]> : T[K];
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

export const grpcConfigSchema = z.object({
  services: z
    .record(
      z.object({
        version: z.string().optional(),
      }),
    )
    .optional(),
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
      userMetadata: z.string().default('x-user-metadata'),
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

export const validateConfig = (config: unknown) => {
  const result = configSchema.safeParse(config);
  if (result.success) return result.data;
  const msg = result.error.errors
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
  throw new Error(`Invalid configuration: ${msg}`);
};

export default validateConfig;
