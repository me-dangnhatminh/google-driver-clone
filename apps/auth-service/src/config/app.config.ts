import z from 'zod';
import { registerAs } from '@nestjs/config';

const appConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().int().default(3000),
  host: z.string().default('localhost'),
  log: z
    .object({
      enabled: z.boolean().default(true),
      level: z
        .enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly'])
        .default('info'),
      accessFile: z.boolean().default(false),
      filePath: z.string().default('logs/%DATE%.error.log'),
    })
    .default({}),
});

export default registerAs('app', () => {
  const parsed = appConfigSchema.parse({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    host: process.env.HOST,
    log: {
      enabled: process.env.LOG_ENABLED,
      level: process.env.LOG_LEVEL,
      accessFile: process.env.LOG_ACCESS_FILE,
      filePath: process.env.LOG_FILE_PATH,
    },
  });
  return parsed;
});
