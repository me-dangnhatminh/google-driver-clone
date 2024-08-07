import z from 'zod';

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
  id: z.string(),
  name: z.string().min(3).max(255),
  amount: Currency,
  currency: CurrencyType,
  intervalDays: Day,
  trialDays: Day.default(7),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  removedAt: z.string().optional(),
});

export const Subscription = z.object({
  id: z.string(),
  planId: z.string(),
  customer: Customer,
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TransactionStatus = z.enum([
  'pending',
  'succeeded',
  'failed',
  'refunded',
]);

export const Transaction = z.object({
  id: z.string(),
  paymentId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: TransactionStatus,
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
});
