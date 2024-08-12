import { util } from 'zod';

export const ErrorCode = util.arrayToEnum(['unknown', 'plan_notfound']);
export type ErrorCode = keyof typeof ErrorCode;

export type ErrorDetail = {
  code: ErrorCode;
  message?: string;
};

export class AppError extends Error {
  constructor(
    public code: ErrorCode = 'unknown',
    public message: string = 'An error occurred',
  ) {
    super(message);
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
    this.name = AppError.name;
  }

  static new(code?: ErrorCode, message?: string) {
    return new AppError(code, message);
  }
}
