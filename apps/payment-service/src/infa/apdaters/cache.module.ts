export * from '@nestjs/cache-manager';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
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
export class CacheModule implements OnModuleInit {
  private readonly logger = new Logger(CacheModule.name);
  constructor(private readonly cache: Cache) {}

  onModuleInit() {
    return this.cache.store
      .set(`test:${Math.random() * 100000}`, 'test', 1)
      .then(() => {
        this.logger.log(`Cache connected`);
      })
      .catch((error) => {
        this.logger.error(`Cache connection error: ${error}`, error.stack);
      });
  }
}
