import { IdempotentService } from './idempotent.service';
import { PaymentService } from './payment.service';
import { IdentityService } from './identity.service';

export * from './idempotent.service';
export * from './payment.service';
export * from './identity.service';

export const services = [IdempotentService, IdentityService, PaymentService];
