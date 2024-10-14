import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class ListFolderQuery implements IQuery {
  constructor(
    public input: {
      filter?: Record<string, unknown>;
      sort?: { field: string; order: 'asc' | 'desc' }[];
      limit?: number;
      offset?: number;
      cursor?: string;
    },
    public metadata: unknown,
  ) {}
}

@QueryHandler(ListFolderQuery)
export class ListFolderHandler implements IQueryHandler<ListFolderQuery> {
  private readonly tx = this.txHost.tx;
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async execute(query: ListFolderQuery) {
    return this.executeOffset(query);
  }

  async executeCursor({ input }: ListFolderQuery) {
    const { filter, sort, limit = 10, cursor } = input;

    const where = filter ? { ...filter } : {};
    const orderBy = sort
      ? sort.reduce(
          (acc, { field, order }) => {
            acc[field] = order;
            return acc;
          },
          {} as Record<string, 'asc' | 'desc'>,
        )
      : {};

    const folders = await this.tx.folder.findMany({
      where,
      orderBy,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const totalCount = await this.tx.folder.count({ where });
    const newCursor = folders.length > limit ? folders[limit].id : null;
    return {
      items: folders.slice(0, limit),
      total: totalCount,
      cursor: newCursor,
    };
  }

  async executeOffset({ input }: ListFolderQuery) {
    const { filter, sort, limit = 10, offset = 0 } = input;

    const where = filter ? { ...filter } : {};
    const orderBy = sort
      ? sort.reduce(
          (acc, { field, order }) => {
            acc[field] = order;
            return acc;
          },
          {} as Record<string, 'asc' | 'desc'>,
        )
      : {};

    const folders = await this.tx.folder.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
    });

    const totalCount = await this.tx.folder.count({ where });
    return { items: folders, total: totalCount };
  }
}
