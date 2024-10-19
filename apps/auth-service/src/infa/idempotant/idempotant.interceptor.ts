import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable, of } from 'rxjs';
import { IdempotentService } from './idempotant.service';

@Injectable()
export class IdempotentInterceptor implements NestInterceptor {
  static readonly DEFAULT_TTL = 60 * 60 * 24;
  constructor(
    private readonly reflector: Reflector,
    private readonly idempotentService: IdempotentService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.getIdempotencyKey(context);
    const ttl = this.getIdempotencyTTL(context);
    if (!key) return next.handle();
    const value = await this.idempotentService.get(key);
    if (value) return of(JSON.parse(value));
    return next.handle().pipe(
      map(async (data) => {
        const dataStr = JSON.stringify(data);
        const dataObj = JSON.parse(dataStr);
        await this.idempotentService.set(key, dataStr, ttl);
        return dataObj;
      }),
    );
  }

  getIdempotencyKey(context: ExecutionContext) {
    const keyOrfactory =
      this.reflector.getAllAndOverride('IDEMPOTENCY_KEY', [
        context.getHandler(),
        context.getClass(),
      ]) ?? null;
    if (!keyOrfactory) return null;
    if (typeof keyOrfactory === 'function') {
      return String(keyOrfactory(context));
    }
    return String(keyOrfactory);
  }

  getIdempotencyTTL(context: ExecutionContext) {
    const ttlOrfactory =
      this.reflector.getAllAndOverride('IDEMPOTENCY_TTL', [
        context.getHandler(),
        context.getClass(),
      ]) ?? null;

    if (ttlOrfactory) return IdempotentInterceptor.DEFAULT_TTL;
    if (typeof ttlOrfactory === 'function') {
      const ttl = ttlOrfactory(context);
      if (isNaN(Number(ttl))) {
        throw new Error(`Invalid idempotency-ttl: ${ttl}`);
      }
      return Number(ttl);
    } else {
      if (isNaN(Number(ttlOrfactory))) {
        throw new Error(`Invalid idempotency-ttl: ${ttlOrfactory}`);
      }
      return Number(ttlOrfactory);
    }
  }
}
