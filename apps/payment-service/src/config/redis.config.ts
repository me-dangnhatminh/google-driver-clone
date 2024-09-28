import { registerAs } from '@nestjs/config';
import z from 'zod';

const config = z.object({
  host: z.string(),
  port: z.coerce.number(),
  db: z.coerce.number().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

const redisConfig = registerAs('redis', () =>
  config.parse({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    db: process.env.REDIS_DB || 0,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  }),
);

export default redisConfig;
