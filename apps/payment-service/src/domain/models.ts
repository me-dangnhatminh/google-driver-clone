import z from 'zod';

const Metadata = z.record(z.string());

export const Customer = z.object({
  id: z.string().uuid(),
  accountId: z.string(),
  email: z.string(),
  name: z.string(),
  created: z.number(),
  updated: z.number(),
  status: z.enum(['active', 'inactive']),
  metadata: Metadata.nullable(),
});
