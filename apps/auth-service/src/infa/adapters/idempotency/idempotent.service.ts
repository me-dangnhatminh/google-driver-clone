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

export const grpcMetadataToObj = (metadata: Metadata) => {
  const obj = {};
  Object.entries(metadata.toJSON()).forEach(([key, value]) => {
    obj[key] = value[0];
  });
  return obj;
};

export type IdempotencyTTLFactory = (cxt: ExecutionContext) => number;
export const IdempotencyTTL = (ttl: number | IdempotencyTTLFactory) => {
  if (typeof ttl === 'number') {
    return SetMetadata('idempotency-ttl', ttl);
  } else {
    return SetMetadata('idempotency-ttl', ttl);
  }
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

    const idempotencyKey = metadata.get('idempotency-key')[0];
    const idempotencyTTL = metadata.get('idempotency-ttl')[0];
    if (!idempotencyKey) return next.handle();

    const key = String(idempotencyKey);
    const value = await this.idempotentService.get(key);
    if (value) return rx.of(JSON.parse(value));

    const ttlStr =
      idempotencyTTL ??
      this.reflector.getAllAndOverride('idempotency-ttl', [
        context.getHandler(),
        context.getClass(),
      ]) ??
      60 * 1000;
    const ttl = parseInt(String(ttlStr));
    if (isNaN(ttl)) {
      throw new Error(`Invalid idempotency-ttl: ${ttlStr}`);
    }

    if (!idempotencyTTL) metadata.set('idempotency-ttl', ttlStr);
    return next.handle();
  }
}
