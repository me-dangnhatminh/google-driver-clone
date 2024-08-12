import { TransactionHost } from '@nestjs-cls/transactional';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Plan } from 'src/domain';

@Injectable()
export class PaymentService {
  constructor(
    private readonly txHost: TransactionHost,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  repo() {
    return this.txHost.tx as PrismaClient;
  }

  async listPlans() {
    const plans = await this.cache.get<Plan[]>('plans');
    return plans || [];
  }

  async createPlan(dto) {
    const plan = Plan.parse(dto);
    const plans = await this.cache
      .get<Plan[]>('plans')
      .then((plans) => plans || []);
    await this.cache.set('plans', [...plans, plan]);

    return plan;
  }

  async getPlanById(id: string) {
    const plans = await this.cache.get<Plan[]>('plans');
    return plans.find((plan) => plan.id === id);
  }
}

export default {};
