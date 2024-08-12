import { z } from 'zod';
import { v4 as uuid } from 'uuid';

export type UUID = z.infer<typeof UUID>;
export type Day = z.infer<typeof Day>;
export type Currency = z.infer<typeof Currency>;
export type CurrencyType = z.infer<typeof CurrencyType>;
export type BillingCycle = z.infer<typeof BillingCycle>;
export type SubStatus = z.infer<typeof SubStatus>;
// export type Metadata = z.infer<typeof Metadata>;
export type FeatureLimit = z.infer<typeof FeatureLimit>;
export type Customer = z.infer<typeof Customer>;
export type Plan = z.infer<typeof Plan>;
export type Tier = z.infer<typeof Tier>;
export type Subscription = z.infer<typeof Subscription>;
export type Payment = z.infer<typeof Payment>;
export type Invoice = z.infer<typeof Invoice>;

export const UUID = z.string().uuid();
export const Day = z.coerce.number().min(0);
export const Currency = z.coerce.number().min(0);
export const CurrencyType = z.enum(['usd', 'eur', 'gbp', 'vnd']);
export const BillingCycle = z.enum(['monthly', 'yearly']);
export const SubStatus = z.enum(['active', 'inactive', 'canceled']);
// export const Metadata = z.record(z.string()).nullable().default(null);

export const Customer = z.object({
  id: z.string(),
  email: z.string().email(),
  isVerified: z.boolean(),
});

export const FeatureLimit = z.object({
  storage: z.object({ limit: z.number() }),
  meeting: z.object({ limit: z.number() }),
});

export const Plan = z.object({
  id: UUID.default(uuid),

  name: z.string().min(3).max(255),
  description: z.string().nullable(),

  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().nullable().default(null),
  removedAt: z.string().nullable().default(null),
});

export const Tier = z.object({
  id: UUID.default(uuid),
  planId: UUID,

  name: z.string().min(3).max(255),
  description: z.string().nullable(),
  plan: Plan.optional(),
  price: Currency,
  currency: CurrencyType,
  billingCycle: BillingCycle,
  featureLimit: FeatureLimit,

  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().nullable().default(null),
  removedAt: z.string().nullable().default(null),
});

export const Subscription = z.object({
  id: UUID,
  customerId: z.string(),
  status: SubStatus,
  customer: Customer.optional(),
  tier: Tier.optional(),

  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().nullable().default(null),
  removedAt: z.string().nullable().default(null),
});

export const Payment = z.object({
  id: UUID,
  tier: Tier,
  customer: Customer,
  subscription: Subscription,
  amount: Currency,
  method: z.string(),

  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().nullable().default(null),
  removedAt: z.string().nullable().default(null),
});

export const Invoice = z.object({
  id: UUID,
  payment: Payment,

  invoiceNumber: z.string(),
  dueDate: z.coerce.date(),

  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().nullable().default(null),
  removedAt: z.string().nullable().default(null),
});
