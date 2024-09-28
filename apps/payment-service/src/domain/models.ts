import z from 'zod';

const Metadata = z.record(z.string());

export const Customer = z.object({
  id: z.string().uuid(),
  account_id: z.string().nullable().default(null),
  account_isp: z.string().nullable().default(null),
  email: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  status: z.enum(['active', 'inactive']).default('active'),
  metadata: Metadata.default({}),
});

export type Customer = z.infer<typeof Customer>;
