import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

export class ListFileRefQuery implements IQuery {
  constructor(
    public readonly input: { id: string },
    public readonly metadata: unknown,
  ) {}
}

@QueryHandler(ListFileRefQuery)
export class ListFileRefHandler implements IQueryHandler<ListFileRefQuery> {
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async execute({ input }: ListFileRefQuery) {
    return input;
  }
}
