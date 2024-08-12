import { TransactionHost } from '@nestjs-cls/transactional';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Plan } from 'src/domain';

import { PlanDTO } from '../dtos';

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
    let plans = await this.cache.get<Plan[]>('plans');
    plans = plans || [];
    return {
      size: plans.length,
      nextCursor: null,
      items: PlanDTO.array().parse(plans),
    };
  }

  async createPlan(dto) {
    const plan = Plan.parse(dto);
    const plans = await this.cache
      .get<Plan[]>('plans')
      .then((plans) => plans || []);
    await this.cache.set('plans', plans.concat(plan));

    return plan;
  }

  async getPlanById(id: string) {
    const plans = await this.cache.get<Plan[]>('plans');
    const plan = plans?.find((p) => p.id === id);
    if (!plan) {
      throw new BadRequestException(`Plan not found: ${id}`);
    }
    return PlanDTO.parse(plan);
  }
}

export default {};
