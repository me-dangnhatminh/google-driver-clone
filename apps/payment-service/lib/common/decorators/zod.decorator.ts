import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

import z from 'zod';
import { AppError, ErrorType } from '../error';

export const ZodBody = <Z extends z.ZodType<unknown>, TZ = z.infer<Z>>(
  schema: Z,
  key?: TZ extends Record<string, any> ? keyof TZ : never,
) => {
  return createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const result = schema.safeParse(request.body);
    if (result.success) {
      if (!key) return result.data;
      if (!result.data) return result.data;
      return (result['data'] as any)[key];
    }
    const res = new AppError({
      type: ErrorType.invalid_request,
      code: 'invalid_body',
      message: 'Invalid request data. Please check the errors.',
      errors: result.error.errors.map((e) => ({
        detail: e.message,
        pointer: e.path.map((p) => p ?? '#').join('/'),
      })),
    });
    throw new BadRequestException(res.error);
  })();
};

export const ZodQuery = (schema: z.ZodType, data?: string) => {
  return createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const result = schema.safeParse(request.query);
    if (result.success) return data ? result.data[data] : result.data;
    throw new BadRequestException({
      type: ErrorType.invalid_request,
      code: ErrorCode.invalid_query,
      message: 'Invalid query data. Please check the errors.',
      errors: result.error.errors.map((e) => ({
        detail: e.message,
        pointer: e.path.map((p) => p ?? '#').join('/'),
      })),
    });
  })();
};
