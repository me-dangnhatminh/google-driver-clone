import { TransactionHost } from '@nestjs-cls/transactional';
import {
  IQuery,
  IQueryHandler,
  IQueryResult,
  QueryHandler,
} from '@nestjs/cqrs';
import { PrismaClient } from '@prisma/client';

import { BadRequestException } from '@nestjs/common';

export class FolderDownloadQuery implements IQuery {
  constructor(public readonly id: string) {}
}

export class FolderDownloadResult implements IQueryResult {
  constructor(
    public readonly name: string,
    public readonly flatContent: any,
  ) {}
}
export type IFolderDownloadHandler = IQueryHandler<
  FolderDownloadQuery,
  FolderDownloadResult
>;
@QueryHandler(FolderDownloadQuery)
export class FolderDownloadHandler implements IFolderDownloadHandler {
  private readonly tx: PrismaClient;
  constructor(private readonly txHost: TransactionHost) {
    this.tx = this.txHost.tx as PrismaClient; // TODO: not shure this run
  }

  async execute(query: FolderDownloadQuery) {
    const folderId = query.id;
    const folder = await this.tx.folder.findUnique({
      where: { id: folderId, archivedAt: null },
    });
    if (!folder) throw new BadRequestException('Folder not found');
    const rootId = folder.rootId ?? folder.id;
    const child = await this.tx.folder.findMany({
      where: {
        rootId: rootId,
        archivedAt: null,
        lft: { gte: folder.lft },
        rgt: { lte: folder.rgt },
        AND: { archivedAt: null },
      },
      select: {
        id: true,
        name: true,
        depth: true,
        parentId: true,
        files: {
          where: { file: { archivedAt: null } },
          select: {
            file: {
              select: { size: true, id: true, name: true, contentType: true },
            },
          },
        },
      },
    });

    return new FolderDownloadResult(folder.name, child);
  }
}
