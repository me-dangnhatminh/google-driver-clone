import { Controller } from '@nestjs/common';
import Stripe from 'stripe';

@Controller()
export class BillingGrpcController {
  constructor(private readonly stripe: Stripe) {}

  createProduct() {}
  listProducts() {}
  deleteProduct() {}
  createPlan() {}
  listPlans() {}
}
