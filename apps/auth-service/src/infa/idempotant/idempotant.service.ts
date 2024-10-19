/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';

@Injectable()
export class IdempotentService {
  constructor() {}

  async get(key: string): Promise<string | null> {
    return 'hello';
  }
  async set(key: string, value: string, ttl?: number): Promise<void> {}
}
