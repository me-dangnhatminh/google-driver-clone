import Redis from 'ioredis';
import Redlock from 'redlock';

import { Module } from '@nestjs/common';
@Module({
  providers: [
    {
      provide: Redlock,
      useFactory: async () => {
        const client = new Redis({
          host: 'localhost',
          port: 6379,
        });
        return new Redlock([client]);
      },
    },
  ],
  exports: [Redlock],
})
export class RedlockModule {}
export default RedlockModule;
