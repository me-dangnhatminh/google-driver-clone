import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly instance: Redis;
  constructor() {
    this.instance = new Redis({
      host: 'localhost',
      port: 6379,
      username: 'default',
    });
  }

  get client() {
    if (!this.instance) {
      throw new Error('Redis client not initialized');
    }
    return this.instance;
  }

  onModuleInit() {}

  onModuleDestroy() {
    this.instance.disconnect();
  }

  get<T>(key: string): Promise<T | null> {
    return this.client.get(key).then((res) => res && JSON.parse(res));
  }

  set<T>(key: string, value: T, milliseconds: number = 5000): Promise<'OK'> {
    return this.client.set(key, JSON.stringify(value), 'PX', milliseconds);
  }
}
