// core error
import { util } from 'zod';

export class AppError<T extends string | number = string> extends Error {
  constructor(
    public readonly code: T,
    public readonly detail: string = 'unknown error',
  ) {
    super(`[${code}] ${detail}`);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

// ====== Error Codes ======

export const ErrorCode = util.arrayToEnum([
  'unknown',
  'invalid_input',
  'not_found',
]);

export type ErrorCodes = keyof typeof ErrorCode;

export class UnknownError extends AppError<ErrorCodes> {
  constructor(detail: string = 'unknown error') {
    super(ErrorCode.unknown, detail);
  }
}
