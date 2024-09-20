import { util } from 'zod';

export const ErrorType = util.arrayToEnum([
  'unknown',
  'invalid_request',
  'unauthorized',
]);

export const AuthErrorCode = util.arrayToEnum([
  'unknown',
  'invalid_token',
  'missing_token',
  'token_expired',
  'invalid_grant',
]);

export type BaseError = {
  type: keyof typeof ErrorType;
  code: keyof typeof AuthErrorCode;
  message?: string;
};

export class AppError<T extends BaseError = BaseError> extends Error {
  constructor(public readonly error: T) {
    super(error.message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }

  static is(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}
