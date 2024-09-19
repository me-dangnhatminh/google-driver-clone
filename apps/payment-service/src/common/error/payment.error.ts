import { arrayToEnum } from 'lib/common';

export type TErrorType = keyof typeof ErrorType;
export type TPaymentErrorCode = keyof typeof PaymentErrorCode;

const ErrorType = arrayToEnum([
  'unknown',
  'invalid_request',
  'command_rejected',
]);

export const PaymentErrorCode = arrayToEnum([
  'payment_failed',
  'payment_not_found',
  'payment_already_exists',
  'payment_not_allowed',
]);

export type ErrorBase = { message?: string };

export const defaultErrorMessage: { [key in TErrorType]: string } = {
  unknown: 'Unknown Error',
  invalid_request: 'Invalid Request',
  command_rejected: 'Command Rejected',
};

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

export interface TPaymentFailedError extends ErrorBase {
  code: typeof PaymentErrorCode.payment_failed;
}

export interface TPaymentNotFoundError extends ErrorBase {
  code: typeof PaymentErrorCode.payment_not_found;
}

export interface TPaymentAlreadyExistsError extends ErrorBase {
  code: typeof PaymentErrorCode.payment_already_exists;
}

export interface TPaymentNotAllowedError extends ErrorBase {
  code: typeof PaymentErrorCode.payment_not_allowed;
}

export type TPaymentErrorOptionalMessage =
  | TPaymentFailedError
  | TPaymentNotFoundError
  | TPaymentAlreadyExistsError
  | TPaymentNotAllowedError;

export type TPaymentError = TPaymentErrorOptionalMessage & {
  code: string;
  message: string;
};

export class PaymentError<
  T extends TPaymentError = TPaymentError,
> extends Error {
  constructor(public readonly error: T) {
    super(error.message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static is(error: any): error is PaymentError {
    return error instanceof PaymentError;
  }
}

export const isPaymentError = (error: any): error is PaymentError => {
  return error instanceof PaymentError;
};

export const paymentAlreadyExists = (
  messageOrError: string | TPaymentAlreadyExistsError,
) => {
  if (typeof messageOrError === 'string') {
    return new PaymentError({
      code: PaymentErrorCode.payment_already_exists,
      message: messageOrError,
    });
  }
  return new PaymentError({
    code: PaymentErrorCode.payment_already_exists,
    message: defaultErrorMessage.invalid_request,
  });
};
