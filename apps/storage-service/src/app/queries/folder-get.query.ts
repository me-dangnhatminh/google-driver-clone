import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetFolderQuery implements IQuery {
  constructor(
    public readonly input: { id: string },
    public readonly metadata: unknown,
  ) {}
}
@QueryHandler(GetFolderQuery)
export class GetFolderHandler implements IQueryHandler<GetFolderQuery> {
  private readonly tx = this.txHost.tx;
  constructor(readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  // TODO: Risk is files to large
  async execute({ input }: GetFolderQuery) {
    const { id } = input;
    const [folder, filesSize] = await Promise.all([
      this.tx.folder.findUnique({ where: { id } }),
      this.tx.folder.findUnique({
        where: { id },
        select: { files: { select: { file: { select: { size: true } } } } },
      }),
    ]);

    const size = filesSize?.files.reduce(
      (acc, { file }) => Number(acc) + Number(file.size),
      0,
    );

    return { ...folder, size };
  }
}
