import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

export class GetFileRefQuery implements IQuery {
  constructor(
    public readonly input: { id: string },
    public readonly metadata: unknown,
  ) {}
}

@QueryHandler(GetFileRefQuery)
export class GetFileRefHandler implements IQueryHandler<GetFileRefQuery> {
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async execute({ input }: GetFileRefQuery) {
    return input;
  }
}
