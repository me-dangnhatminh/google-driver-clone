import { Module } from '@nestjs/common';
import Redis from 'ioredis';

@Module({
  providers: [
    {
      provide: 'IDEMPOTENT_SERVICE',
      useValue: new Redis({ host: 'localhost', port: 6379 }),
    },
  ],
  exports: ['IDEMPOTENT_SERVICE'],
})
export class IdempotentModule {}
