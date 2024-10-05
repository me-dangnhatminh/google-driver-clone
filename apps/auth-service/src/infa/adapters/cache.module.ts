export * from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import {
  CACHE_MANAGER,
  CacheModule as NestCacheModule,
  Cache,
} from '@nestjs/cache-manager';

import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService) => {
        const redis = configService.get('redis', { infer: true });
        const url = `redis://${redis.host}:${redis.port}/${redis.db}`;
        return {
          store: redisStore,
          url: url,
          username: redis.username,
          password: redis.password,
        };
      },
    }),
  ],
  providers: [{ provide: Cache, useExisting: CACHE_MANAGER }],
  exports: [Cache],
})
export class CacheModule {}
