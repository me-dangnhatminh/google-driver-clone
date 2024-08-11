import { Plan } from 'src/domain';
import { z } from 'zod';

export const CreatePlanDTO = Plan.pick({
  name: true,
  price: true,
  currency: true,
  intervalDays: true,
});

export const UpdatePlanDTO = CreatePlanDTO.partial();

export const SubscriptionDTO = z.object({
  planId: z.string(),
  customerId: z.string(),
});

export type CreatePlanDTO = z.infer<typeof CreatePlanDTO>;
export type UpdatePlanDTO = z.infer<typeof UpdatePlanDTO>;
export type SubscriptionDTO = z.infer<typeof SubscriptionDTO>;
