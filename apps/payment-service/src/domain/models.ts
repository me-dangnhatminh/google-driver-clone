import z from 'zod';
import { v4 as uuid } from 'uuid';

export type Customer = z.infer<typeof Customer>;
export type Admin = z.infer<typeof Admin>;

export type Plan = z.infer<typeof Plan>;
export type Subscription = z.infer<typeof Subscription>;

export const Day = z.coerce.number().min(0);
export const Customer = z.object({ id: z.string(), email: z.string().email() });
export const Admin = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.literal('admin'),
});
export const Currency = z.coerce.number().min(0);
export const CurrencyType = z.enum(['usd', 'eur', 'gbp', 'vnd']);

export const Plan = z.object({
  id: z.string().uuid().default(uuid),
  name: z.string().min(3).max(255),
  description: z.string().nullable(),
  price: Currency,
  currency: CurrencyType,
  intervalDays: Day,
  trialDays: Day.default(7),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().nullable().default(null),
  removedAt: z.string().nullable().default(null),
});

export const SubStatus = z.enum(['active', 'inactive', 'canceled']);

export const Subscription = z.object({
  id: z.string(),
  planId: z.string(),
  customer: Customer,
  status: SubStatus,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PaymentStatus = z.enum(['paid', 'unpaid', 'refunded']);
export const Payment = z.object({
  id: z.string(),
  status: PaymentStatus,
  customer: Customer,
  plan: Plan,
  subscription: Subscription,
});
