import { applyDecorators, ExecutionContext, SetMetadata } from '@nestjs/common';

export const IdempotentTTL = (ttlMs: number) => {
  return applyDecorators(SetMetadata('idempotency-ttl', ttlMs));
};

type IdempotentKeyFactory = (ctx: ExecutionContext) => Promise<string> | string;
export const IdempotentKey = (key: string | IdempotentKeyFactory) => {
  if (typeof key === 'string') {
    return applyDecorators(SetMetadata('idempotency-key', key));
  } else {
    return applyDecorators(SetMetadata('idempotency-key', key));
  }
};

// implementation Idempotent call service and return the result

// export const Idempotent = (): MethodDecorator => {
//   return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
//     const originalMethod = descriptor.value;
//     descriptor.value = async function (...args: any[]) {
//       const result = await originalMethod.apply(this, args);
//       return result;
//     };
//     return descriptor;
//   };
// };
