import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export type AppConfig = ConfigType<typeof config>;

const configSchema = z.object({
  name: z.string().default('App'),
  port: z.coerce.number().default(3000),
  host: z.string().default('0.0.0.0'),
});

const configName = 'app';
export const config = registerAs(configName, () => {
  const valid = configSchema.safeParse({
    name: process.env.APP_NAME,
    port: process.env.APP_PORT,
    host: process.env.APP_HOST,
  });
  if (valid.success) return valid.data;
  const msg = valid.error.errors
    .map((err) => `- ${err.path.join('.')}: ${err.message}`)
    .join('\n');
  throw new Error(`Invalid ${configName} config:\n${msg}`);
});

export default config;
