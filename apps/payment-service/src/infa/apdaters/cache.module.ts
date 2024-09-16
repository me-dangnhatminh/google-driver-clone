import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      store() {
        return redisStore({
          url: 'redis://localhost:6379',
        }).catch((err) => {
          console.error(err);
          throw err;
        });
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
