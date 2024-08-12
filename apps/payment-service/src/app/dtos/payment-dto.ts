import { z } from 'zod';
import { Plan, Tier } from 'src/domain';

export const PlanDTO = Plan.omit({
  createdAt: true,
  updatedAt: true,
  removedAt: true,
});

export const CreatePlanDTO = Plan.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  removedAt: true,
});

export const CreateTierDTO = Tier.pick({
  name: true,
  description: true,
  price: true,
  currency: true,
  billingCycle: true,
  featureLimit: true,
});

export type PlanDTO = z.infer<typeof PlanDTO>;
export type CreatePlanDTO = z.infer<typeof CreatePlanDTO>;
export type CreateTierDTO = z.infer<typeof CreateTierDTO>;
