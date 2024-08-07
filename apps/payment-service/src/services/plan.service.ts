import { Plan } from '../domain';

export class PlanService {
  private readonly plans: Plan[] = [];
  constructor() {}

  async create(plan: Plan): Promise<Plan> {
    this.plans.push(plan);
    return plan;
  }

  async getPlanById(id: string): Promise<Plan> {
    return this.plans.find((plan) => plan.id === id);
  }
}
