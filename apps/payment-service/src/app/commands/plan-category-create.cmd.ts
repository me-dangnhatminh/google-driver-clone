import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import z from 'zod';

import { PlanCategory } from 'src/domain';

export const PlanCategoryCreateInput = PlanCategory;
export type PlanCategoryCreateInput = z.infer<typeof PlanCategoryCreateInput>;

export class PlanCategoryCreateCmd implements ICommand {
  constructor(public readonly input: PlanCategoryCreateInput) {
    this.input = PlanCategoryCreateInput.parse(input);
  }
}

export class PlanCategoryCreateHandler
  implements ICommandHandler<PlanCategoryCreateCmd>
{
  private readonly tx = this.txHost.tx;
  constructor(readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}
  async execute(cmd: PlanCategoryCreateCmd) {
    const { input } = cmd;
    return this.tx.planCategory
      .create({ data: input })
      .then(() => {})
      .catch((e) => {
        if (e.code === 'P2002') {
          throw new Error('Category already exists');
        }
        throw e;
      });
  }
}
