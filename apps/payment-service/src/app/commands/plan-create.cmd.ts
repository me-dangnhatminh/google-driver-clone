import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import z from 'zod';
import { Plan } from 'src/domain';

export const PlanCreateInput = Plan;
export type PlanCreateInput = z.infer<typeof PlanCreateInput>;

export class PlanCreateCmd implements ICommand {
  constructor(public readonly input: PlanCreateInput) {
    this.input = PlanCreateInput.parse(input);
  }
}

export class PlanCreateHandler implements ICommandHandler<PlanCreateCmd> {
  private readonly tx = this.txHost.tx;
  constructor(readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}
  async execute() {}
}
