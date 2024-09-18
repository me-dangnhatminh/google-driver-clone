import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ZodValidator implements PipeTransform {
  constructor(
    private readonly schema: z.ZodType,
    private readonly code: string,
  ) {}

  transform(value) {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;
    throw new BadRequestException({
      type: 'invalid_request_error',
      code: this.code,
      message: 'Invalid request data. Please check the errors.',
      errors: result.error.errors.map((e) => ({
        detail: e.message,
        pointer: e.path.map((p) => p ?? '#').join('/'), // # is root, ex: #/data/0
      })),
    });
  }
}

export function useZod<T = unknown>(
  schema: z.ZodType<T>,
  code: string = 'invalid_argument',
) {
  return new ZodValidator(schema, code);
}
