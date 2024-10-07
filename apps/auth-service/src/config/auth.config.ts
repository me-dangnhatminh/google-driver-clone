import z from 'zod';
import { registerAs } from '@nestjs/config';

const configSchema = z.object({
  strict: z.boolean().default(false), // if true, dont allow anonymous users
  headers: z
    .object({
      userId: z.string().default('x-user-id'),
      anonymous: z.string().default('x-anonymous'),
      strict: z.string().default('x-strict'),
    })
    .default({}),
});

export default registerAs('auth', () => {
  return configSchema.parse({});
});
