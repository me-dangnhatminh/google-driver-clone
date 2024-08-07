import z from 'zod';

export const Subscription = z.object({
  id: z.string(),
  planId: z.string(),
  userId: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Subscription = z.infer<typeof Subscription>;

export class SubscriptionService {
  private readonly subscriptions: Subscription[] = [];
  constructor() {}
  async create(sub: Subscription): Promise<Subscription> {
    this.subscriptions.push(sub);
    return sub;
  }
  async getById(id) {
    return this.subscriptions.find((sub) => sub.id === id);
  }
}
