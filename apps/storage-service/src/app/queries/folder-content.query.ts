import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class ContentFolderQuery implements IQuery {
  constructor(
    public readonly input: {
      id: string;
      limit?: number;
      cursors?: string;

      filter?: Record<string, any>;
      sort?: Record<string, string>;
      offset?: number;
      cursor?: string;
    },
    public readonly metadata: unknown,
  ) {}
}

@QueryHandler(ContentFolderQuery)
export class ContentFolderHandler implements IQueryHandler<ContentFolderQuery> {
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async execute({ input }: ContentFolderQuery) {
    const { id, limit = 10, cursors } = input;

    const [folderCursor, fileCursor] = cursors
      ? cursors.split(',').map((c) => (c === 'null' ? null : c))
      : [null, null];

    const getItems = Promise.all([
      this.tx.folder.findMany({
        where: { parentId: id },
        cursor: folderCursor ? { id: folderCursor } : undefined,
        take: limit + 1,
        orderBy: { createdAt: 'desc' },
      }),
      this.tx.fileInFolder
        .findMany({
          where: { folderId: id },
          cursor: fileCursor ? { fileId: fileCursor } : undefined,
          include: { file: true },
          take: limit + 1,
          orderBy: { file: { createdAt: 'desc' } },
        })
        .then((files) => files.map((f) => f.file)),
    ]);

    const countItems = Promise.all([
      this.tx.folder.count({ where: { parentId: id } }),
      this.tx.fileInFolder.count({ where: { folderId: id } }),
    ]);

    const [folders, files] = await getItems;
    const [totalFolders, totalFiles] = await countItems;
    const foldersWithKind = folders.map((f) => ({ ...f, kind: 'folder' }));
    const filesWithKind = files.map((f) => ({ ...f, kind: 'file' }));

    // === Pagination ===
    const totalItems = totalFolders + totalFiles;
    const folderNextCursor = folders.length > limit ? folders[limit].id : null;
    const fileNextCursor = files.length > limit ? files[limit].id : null;

    const nextCursors = [folderNextCursor, fileNextCursor]
      .map((c) => c ?? 'null')
      .join(',');

    return {
      items: [
        ...foldersWithKind.slice(0, limit),
        ...filesWithKind.slice(0, limit),
      ],
      total: totalItems,
      prevCursors: cursors,
      nextCursors,
    };
  }
}
