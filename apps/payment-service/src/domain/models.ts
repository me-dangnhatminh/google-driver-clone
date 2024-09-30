import z from 'zod';

const Metadata = z.record(z.string());

export const Customer = z.object({
  id: z.string(),
  account_id: z.string(),
  email: z.string().email().optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  features: z.record(z.string()),
  entitlements: z.record(z.string()),
  metadata: Metadata.default({}),
});
