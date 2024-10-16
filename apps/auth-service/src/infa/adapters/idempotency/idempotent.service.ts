import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import Redis from 'ioredis';
import * as rx from 'rxjs';
import { Reflector } from '@nestjs/core';

export const IdempotencyTTL = (ttlMs: number) => {
  return SetMetadata('idempotency-ttl', ttlMs);
};

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(
    @Inject('IDEMPOTENT_SERVICE')
    private readonly idempotentService: Redis,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const type = context.getType();
    if (type !== 'rpc') {
      this.logger.warn(`not supported '${type}', only support rpc`);
      return next.handle();
    }

    const rpc = context.switchToRpc();
    const metadata: Metadata = rpc.getContext();

    const idempotency = metadata.get('idempotency-key')[0];
    let idempotencyTTl = metadata.get('idempotency-ttl')[0];
    const key = idempotency && String(idempotency);
    if (!key) return next.handle();

    const value = await this.idempotentService.get(key);
    if (value) return rx.of(JSON.parse(value));
    idempotencyTTl =
      idempotencyTTl ??
      this.reflector.getAllAndOverride('idempotency-ttl', [
        context.getHandler(),
        context.getClass(),
      ]);
    metadata.set('idempotency-ttl', String(idempotencyTTl));
    return next.handle();
  }
}
