const arrayToEnum = <T extends string, U extends [T, ...T[]]>(
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

export class AppError<T extends string | number = string> extends Error {
  constructor(
    public readonly code: T,
    public readonly detail: string = 'unknown error',
  ) {
    super(`[${code}] ${detail}`);
    Object.setPrototypeOf(this, AppError.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this);
  }
}

// ====== Error Codes ======

export const ErrorCode = arrayToEnum(['unknown', 'invalid_input', 'not_found']);

export type ErrorCodes = keyof typeof ErrorCode;

export class UnknownError extends AppError<ErrorCodes> {
  constructor(detail: string = 'unknown error') {
    super(ErrorCode.unknown, detail);
  }
}

export class InvalidInputError extends AppError<ErrorCodes> {
  constructor(detail: string = 'invalid input') {
    super(ErrorCode.invalid_input, detail);
  }
}
