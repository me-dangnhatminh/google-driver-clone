import { registerAs } from '@nestjs/config';

export default registerAs('rmq', () => ({
  url: process.env.RMQ_URL ?? 'amqp://localhost:5672',
  queue: process.env.RMQ_QUEUE ?? 'storage-service',
}));
