import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ZodValidator implements PipeTransform {
  constructor(private readonly schema: z.ZodType<any>) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;
    const msg = result.error.errors
      .map((e) => {
        const path = e.path.join('.');
        if (path === '') return e.message;
        else return `${path}: ${e.message}`;
      })
      .join(', ');
    throw new BadRequestException(msg);
  }
}

export function useZod<T = unknown>(schema: z.ZodType<T>) {
  return new ZodValidator(schema);
}
