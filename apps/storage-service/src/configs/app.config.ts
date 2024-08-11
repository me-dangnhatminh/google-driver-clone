import { z } from 'zod';

const AppConfigValidator = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_NAME: z.string().default('notification'),
  APP_HOST: z.string().default('0.0.0.0'),
  APP_PORT: z.coerce.number().default(9004),
  HTTP_URL: z.string().default('http://localhost:9004'),
});

export type AppConfig = z.infer<typeof AppConfigValidator>;

export default () => AppConfigValidator.parse(process.env);
