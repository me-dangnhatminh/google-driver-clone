import { arrayToEnum } from 'lib/common';

export const PaymentErrorCode = arrayToEnum([
  'not_found',
  'invalid_body',
  'invalid_query',
  'invalid_parameter',
  'permission_denied',
  'resource_exhausted',
]);

export type PaymentErrorCode = keyof typeof PaymentErrorCode;
export type PaymentBaseError = { message?: string };

export type PaymentNotFoundError = PaymentBaseError & {
  code: typeof PaymentErrorCode.not_found;
};

export type IPaymentError = PaymentNotFoundError;

export class PaymentError extends Error {
  constructor(public readonly error: IPaymentError) {
    super(error.message);
  }

  static new(error: IPaymentError) {
    return new PaymentError(error);
  }
}
