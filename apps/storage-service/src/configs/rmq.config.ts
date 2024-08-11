import { z } from 'zod';

const RMQConfigValidator = z.object({
  URLS: z
    .string()
    .transform((value) => value.split(',').map((url) => url.trim()))
    .default('amqp://localhost:5672'),
  QUEUE: z.string().default('storage_queue'),
});

export type RMQConfig = z.infer<typeof RMQConfigValidator>;

export default () => RMQConfigValidator.parse(process.env);
