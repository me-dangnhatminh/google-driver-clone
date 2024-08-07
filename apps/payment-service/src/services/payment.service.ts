import { Injectable } from '@nestjs/common';
import { IdempotentService } from './idempotent.service';

@Injectable()
export class PaymentService {
  constructor(private readonly idempotentService: IdempotentService) {}

  getBalance() {
    // Call to external service
    // return the balance of the user for the payment service, is used to check if the user has enough balance to make a payment
  }

  checkout() {
    return 'Checkout';
  }

  refund() {}

  capture() {}

  cancel() {}

  createPayment() {}
  updatePayment() {}
  deletePayment() {}
  getPayment() {}
}
