export * from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import {
  CACHE_MANAGER,
  CacheModule as NestCacheModule,
  Cache,
} from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

import { Configs } from 'src/config';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => {
        const redis = configService.get('redis', { infer: true });
        const url = `redis://${redis.host}:${redis.port}/${redis.db}`;
        Logger.log(`Redis connected: ${url}`, CacheModule.name);
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
