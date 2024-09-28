import { registerAs } from '@nestjs/config';
import { RmqOptions } from '@nestjs/microservices';

export default registerAs('rmq', () => {
  const auth: RmqOptions['options'] = {
    urls: ['amqp://localhost:5672'],
    queue: 'auth_queue',
  };

  return { auth };
});
