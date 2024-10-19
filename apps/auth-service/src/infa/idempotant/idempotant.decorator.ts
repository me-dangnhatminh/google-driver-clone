/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Inject,
  ExecutionContext,
  applyDecorators,
  SetMetadata,
} from '@nestjs/common';
import { IdempotentHandler } from './idempotant.handler';

const IdempotentHandlerToken = Symbol('IdempotentHandlerToken');
export function Idempotent() {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!target[IdempotentHandlerToken]) {
      const inject = Inject(IdempotentHandler);
      inject(target, IdempotentHandlerToken);
    }

    const original = descriptor.value;
    descriptor.value = new Proxy(original, {
      apply: async (target, thisArg, args) => {
        const handler = thisArg[IdempotentHandlerToken];
        if (!handler) {
          throw new Error(`IdempotentHandler not found`);
        }

        return target.apply(thisArg, args);
      },
    });
  };
}

type IdempotentKeyFactory = (ctx: ExecutionContext) => Promise<string> | string;
export const IdempotentKey = (key: string | IdempotentKeyFactory) => {
  return applyDecorators(SetMetadata('IDEMPOTENCY_KEY', key));
};

type IdempotentTTLFactory = (ctx: ExecutionContext) => number;
export const IdempotentTTL = (ttl: number | IdempotentTTLFactory) => {
  return applyDecorators(SetMetadata('IDEMPOTENCY_TTL', ttl));
};
