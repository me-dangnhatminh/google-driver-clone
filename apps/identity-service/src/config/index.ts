import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const appConfigSchema = z.object({
  name: z.string().default('App'),
  port: z.coerce.number().default(3000),
  host: z.string().default('0.0.0.0'),
});

const corsConfigSchema = z.object({
  enabled: z.boolean().default(true),
  origin: z.string().default('*'),
});

const grpcConfigSchema = z.object({
  host: z.string().default('0.0.0.0'),
  port: z.coerce.number().default(50051),
});

const svcUrlConfigSchema = z.object({
  identity: z.object({ url: z.string().default('localhost:50051') }),
});

const redisConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.coerce.number().default(6379),
  db: z.coerce.number().default(0),
  username: z.string().optional(),
  password: z.string().optional(),
});

const swaggerConfigSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().default('API Documentation'),
  description: z.string().default('API Documentation'),
  prefix: z.string().default('api'),
  version: z.string().default('1.0'),
});

export const appConfig = registerAs('app', () =>
  appConfigSchema.parse({
    name: process.env.APP_NAME,
    port: process.env.APP_PORT,
    host: process.env.APP_HOST,
  }),
);

export const corsConfig = registerAs('cors', () =>
  corsConfigSchema.parse({
    enabled: process.env.CORS_ENABLED,
    origin: process.env.CORS_ORIGIN,
  }),
);

export const grpcConfig = registerAs('grpc', () =>
  grpcConfigSchema.parse({
    enabled: process.env.GRPC_ENABLED,
    port: process.env.GRPC_PORT,
  }),
);

export const svcUrlConfig = registerAs('svcUrl', () =>
  svcUrlConfigSchema.parse({ identity: { url: process.env.IDENTITY_SVC_URL } }),
);

export const redisConfig = registerAs('redis', () =>
  redisConfigSchema.parse({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  }),
);

export const swaggerConfig = registerAs('swagger', () => ({
  enabled: process.env.SWAGGER_ENABLED,
  title: process.env.SWAGGER_TITLE,
  description: process.env.SWAGGER_DESCRIPTION,
  prefix: process.env.SWAGGER_PREFIX,
  version: process.env.SWAGGER_VERSION,
}));

export type AppConfig = z.infer<typeof appConfigSchema>;
export type CorsConfig = z.infer<typeof corsConfigSchema>;
export type GrpcConfig = z.infer<typeof grpcConfigSchema>;
export type RedisConfig = z.infer<typeof redisConfigSchema>;
export type SwaggerConfig = z.infer<typeof swaggerConfigSchema>;
export type SvcUrlConfig = z.infer<typeof svcUrlConfigSchema>;

export type Config = {
  app: AppConfig;
  cors: CorsConfig;
  grpc: GrpcConfig;
  redis: RedisConfig;
  swagger: SwaggerConfig;
  svcUrl: SvcUrlConfig;
};

const config = [
  appConfig,
  corsConfig,
  grpcConfig,
  redisConfig,
  swaggerConfig,
  svcUrlConfig,
];

export default config;
