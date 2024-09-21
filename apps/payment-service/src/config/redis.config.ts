import { registerAs } from '@nestjs/config';

const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
}));

export default redisConfig;
