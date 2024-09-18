import { arrayToEnum } from '../utils';

export const ErrorType = arrayToEnum([
  'unknown',
  'invalid_request',
  'api_error',
  'command_rejected',
]);

export const ErrorCode = arrayToEnum([
  'invalid_body',
  'invalid_query',
  'invalid_params',
  'invalid_headers',
  'invalid_token',
]);

export type ErrorType = keyof typeof ErrorType;

export type ErrorBase = { message?: string };

export interface UnknownError extends ErrorBase {
  type: typeof ErrorType.unknown;
}

export interface CommandRejectedError extends ErrorBase {
  type: typeof ErrorType.command_rejected;
  command: string;
}

export interface CommandRejectedError extends ErrorBase {
  type: typeof ErrorType.command_rejected;
  command: string;
}

export type AppErrorOptionalMessage = UnknownError | CommandRejectedError;

export type IAppError = AppErrorOptionalMessage & {
  message: string;
  code: string;
};

export class AppError extends Error {
  constructor(
    private errors: IAppError[],
    message?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  get message() {
    return 'AppError';
  }

  static is(error: any): error is AppError {
    return error instanceof AppError;
  }

  static new(errors: IAppError | IAppError[], message?: string) {
    return new AppError(Array.isArray(errors) ? errors : [errors], message);
  }

  addError(error: IAppError) {
    this.errors.push(error);
  }

  addErrors(errors: IAppError[]) {
    this.errors.push(...errors);
  }
}
