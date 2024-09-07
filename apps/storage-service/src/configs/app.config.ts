import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const appConfigSchema = z.object({
  name: z.string().default('App'),
  port: z.coerce.number().default(3000),
  host: z.string().default('0.0.0.0'),
});

export type AppConfig = z.infer<typeof appConfigSchema>;
export const appConfig = registerAs('app', () => {
  const valid = appConfigSchema.safeParse({
    name: process.env.APP_NAME,
    port: process.env.APP_PORT,
    host: process.env.APP_HOST,
  });
  if (valid.success) return valid.data;
  const msg = valid.error.errors.map((err) => err.message).join(', ');
  throw new Error('Invalid app config: ' + msg);
});

export default appConfig;
