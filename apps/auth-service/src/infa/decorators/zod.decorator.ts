import z from 'zod';
import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  UsePipes,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodType<any, any>) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    const valid = this.schema.safeParse(value);
    if (valid.success) return valid.data;
    const error_msg = valid.error.errors
      .map((e) => `${e.path.join('.')} ${e.message}`)
      .join(', ');
    throw new RpcException({
      code: grpc.status.INVALID_ARGUMENT,
      message: error_msg,
    });
  }
}

export const UseZodPipes = (
  schema: z.ZodType<any, any>,
  ...pipes: PipeTransform[]
): MethodDecorator => {
  return UsePipes(new ZodValidationPipe(schema), ...pipes);
};
