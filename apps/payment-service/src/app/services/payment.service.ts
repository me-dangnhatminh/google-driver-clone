import { TransactionHost } from '@nestjs-cls/transactional';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import { PlanedEvent } from 'src/domain/events';
import { CreatePlanDTO, SubscriptionDTO, UpdatePlanDTO } from '../dtos';
import { Plan } from 'src/domain/models';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cache: Cache,
    @Inject('PAYMENT_SERVICE') protected readonly client: ClientProxy,
    protected readonly txHost: TransactionHost,
  ) {}

  async getPlanById(id: string) {
    const tx = this.txHost.tx as PrismaClient;
    return await tx.plan.findUnique({ where: { id } });
  }

  async listPlans(options?: { active?: boolean }) {
    const tx = this.txHost.tx as PrismaClient;
    return await tx.plan.findMany({
      where: {
        deletedAt: options && (options.active ? null : { not: null }),
      },
    });
  }

  async createPlan(dto: CreatePlanDTO) {
    const tx = this.txHost.tx as PrismaClient;
    const data = Plan.parse(dto);
    await tx.plan.create({
      data: {
        id: data.id,
        name: data.name,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        currency: data.currency,
        description: data.description,
        intervalDays: data.intervalDays,
        price: data.price,
        trialDays: data.trialDays,
        deletedAt: data.removedAt,
      },
    });

    return data;
  }

  async updatePlan(id: string, dto: UpdatePlanDTO) {
    const tx = this.txHost.tx as PrismaClient;
    return await tx.plan.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async deletePlan(id: string) {
    const tx = this.txHost.tx as PrismaClient;
    return await tx.plan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async subscribe(dto: SubscriptionDTO) {
    // Call to external service
    // return the subscription object
    const tx = this.txHost.tx as PrismaClient;
    const plan = await tx.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) {
      throw new Error('Plan not found');
    }

    const subscription = await tx.subscription.create({
      data: {
        id: '1', // TODO: generate a unique id
        planId: plan.id,
        customerId: dto.customerId,
        status: 'active',
        endedAt: null,
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      },
    });

    this.client.emit<PlanedEvent>('planed', subscription);
  }

  getBalance() {
    // Call to external service
    // return the balance of the user for the payment service, is used to check if the user has enough balance to make a payment
  }

  checkout() {
    return 'Checkout';
  }

  refund() {}

  capture() {}

  cancel() {}

  createPayment() {}
  updatePayment() {}
  deletePayment() {}
  getPayment() {}
}
