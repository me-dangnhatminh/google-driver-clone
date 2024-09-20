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

export const ErrorType = arrayToEnum(['invalid_request', 'unauthorized']);
export type ErrorTypes = keyof typeof ErrorType;

export type ErrorBase = {
  type: ErrorTypes;
  code: string;
  message: string;
};

export class AppError<T extends ErrorBase = ErrorBase> extends Error {
  constructor(error: T) {
    super(error.message);
    Object.setPrototypeOf(this, AppError.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this);
  }
}

// // ====== Error Codes ======

// export const ErrorCode = arrayToEnum(['unknown', 'invalid_input', 'not_found']);

// export type ErrorCodes = keyof typeof ErrorCode;

// export class UnknownError extends AppError<ErrorCodes> {
//   constructor(detail: string = 'unknown error') {
//     super(ErrorCode.unknown, detail);
//   }
// }

// export class InvalidInputError extends AppError<ErrorCodes> {
//   constructor(detail: string = 'invalid input') {
//     super(ErrorCode.invalid_input, detail);
//   }
// }
