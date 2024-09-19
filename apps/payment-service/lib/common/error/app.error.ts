import { arrayToEnum } from '../utils';

export type TErrorType = keyof typeof ErrorType;
export const ErrorType = arrayToEnum([
  'unknown',
  'invalid_request',
  'command_rejected',
]);

export type ErrorBase = { message?: string };

export interface TUnknownError extends ErrorBase {
  type: typeof ErrorType.unknown;
}

export interface TCommandRejectedError extends ErrorBase {
  type: typeof ErrorType.command_rejected;
  command: string;
}

export interface TInvalidRequestError extends ErrorBase {
  type: typeof ErrorType.invalid_request;
  errors: { detail: string; pointer: string }[];
}

export type TAppErrorOptionalMessage =
  | TUnknownError
  | TCommandRejectedError
  | TInvalidRequestError;

export type TAppError = TAppErrorOptionalMessage & {
  message: string;
  code: string;
};

export class AppError<T extends TAppError = TAppError> extends Error {
  constructor(public readonly error: T) {
    super(error.message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static is(error: any): error is AppError {
    return error instanceof AppError;
  }
}
