import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const configSchema = z.object({
  port: z.coerce.number().default(3000),
  host: z.string().default('0.0.0.0'),
});

export default registerAs('app', () => {
  const valid = configSchema.safeParse({
    port: process.env.PORT,
    host: process.env.HOST,
  });
  if (valid.success) return valid.data;
  const msg = valid.error.errors.map((err) => err.message).join(', ');
  throw new Error(`Invalid 'app' config: ${msg}`);
});
