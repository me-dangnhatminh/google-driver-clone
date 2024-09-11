export const arrayToEnum = <T extends string, U extends [T, ...T[]]>(
  items: U,
): { [k in U[number]]: k } => {
  return items.reduce(
    (acc, item) => {
      acc[item] = item;
      return acc;
    },
    {} as { [key in T]: key },
  );
};

export class AppError<T extends string = string> extends Error {
  constructor(
    public readonly code: T,
    message?: string,
  ) {
    super(message);
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) Object.setPrototypeOf(this, actualProto);
    else (this as any).__proto__ = actualProto;
    this.name = AppError.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const isAppError = (err: unknown): err is AppError => {
  return err instanceof AppError;
};

export const ErrorCode = arrayToEnum([
  'unknown',
  'invalid_input',
  'storage_notfound',
  'file_notfound',
]);
export type ErrorCode = typeof ErrorCode;
export type ErrorCodes = keyof typeof ErrorCode;

export class UnknownError extends AppError<ErrorCodes> {
  constructor(message: string = 'Unknown error') {
    super(ErrorCode.unknown, message);
  }
}

export class InvalidInputError extends AppError<ErrorCodes> {
  constructor(message: string = 'Invalid input') {
    super(ErrorCode.invalid_input, message);
  }
}
