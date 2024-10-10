export * from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import {
  CACHE_MANAGER,
  CacheModule as NestCacheModule,
  Cache,
  CacheOptions,
} from '@nestjs/cache-manager';

import { ConfigService } from 'src/config';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ): CacheOptions<Record<string, any>> => {
        const logger = new Logger('CacheModule');
        const cacheConfig = configService.infer('cache');
        const use = cacheConfig.use;
        if (use === 'redis') {
          const redisConfig = cacheConfig.redis;
          logger.log(`Using 'redis' cache store: ${redisConfig.url}`);
          return {
            store: redisStore,
            url: redisConfig.url,
            username: redisConfig.username,
            password: redisConfig.password,
          };
        }
        if (use === 'memory') {
          logger.log(`Using 'memory' cache store`);
          return {};
        }
        logger.error(`Cache store ${use} not supported, using 'memory'`);
        return {};
      },
    }),
  ],
  providers: [{ provide: Cache, useExisting: CACHE_MANAGER }],
  exports: [Cache],
})
export class CacheModule {}
