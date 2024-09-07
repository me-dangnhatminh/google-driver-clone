// zod validation for grpc requests
import { RpcException } from '@nestjs/microservices';
import { z } from 'zod';
import * as grpc from '@grpc/grpc-js';

export const ZodGrpcValidator = (schema: z.ZodType<any, any>) => {
  return (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [req] = args;
      const valid = schema.safeParse(req);
      if (!valid.success) {
        const msg = valid.error.errors
          .map((e) => `${e.path.join('.')} ${e.message}`)
          .join(', ');
        throw new RpcException({
          code: grpc.status.INVALID_ARGUMENT,
          message: msg,
        });
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};
