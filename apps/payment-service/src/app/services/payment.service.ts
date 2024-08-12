import { TransactionHost } from '@nestjs-cls/transactional';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// import { AppError } from 'src/common/base-error';
import { Plan } from 'src/domain';

import { PlanDTO } from '../dtos';
import { AppError } from 'src/common/app-error';

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
    const errCtx = new AppError([]);

    const plans = await this.cache.get<Plan[]>('plans');
    const plan = plans?.find((p) => p.id === id);
    if (!plan) {
      return errCtx
        .addIssue({
          path: [id],
          code: 'plan_notfound',
          message: 'Plan not found',
        })
        .throw();
    }
    return PlanDTO.parse(plan);
  }
}

export default {};
