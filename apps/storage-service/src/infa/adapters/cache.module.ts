import { Module } from '@nestjs/common';
import {
  CacheModule as NestCacheModule,
  Cache,
  CACHE_MANAGER,
} from '@nestjs/cache-manager';

@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
    }),
  ],
  providers: [{ provide: Cache, useExisting: CACHE_MANAGER }],
  exports: [Cache],
})
export class CacheModule {}
