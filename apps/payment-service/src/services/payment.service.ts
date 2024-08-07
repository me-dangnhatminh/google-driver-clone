import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PlanedEvent } from 'src/domain/events';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly client: ClientProxy,
  ) {}

  getCustomerPlan(customerId: string) {
    return {
      id: '1',
      customerId,
      name: 'Basic',
    };
  }

  getById(id: string) {
    return {
      id,
      customerId: '1',
      amount: 100,
      currency: 'USD',
      status: 'paid',
    };
  }

  subscribe() {
    const event: PlanedEvent = {
      name: 'planed',
      id: '1',
      timestamp: Date.now(),
      payload: {
        planId: '1',
        name: 'basic',
        amount: 100,
      },
    };

    this.client.emit(event.name, event);

    return 'Subscribe';
  }

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
