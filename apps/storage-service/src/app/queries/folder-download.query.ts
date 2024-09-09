import { TransactionHost } from '@nestjs-cls/transactional';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaClient } from '@prisma/client';

import { BadRequestException } from '@nestjs/common';

import { StorageDiskService } from 'src/app/services';

export class DowloadFolder implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(DowloadFolder)
export class FolderDownloadHandler implements IQueryHandler<DowloadFolder> {
  private readonly tx: PrismaClient;
  constructor(
    private readonly txHost: TransactionHost,
    private readonly diskStorage: StorageDiskService,
  ) {
    this.tx = this.txHost.tx as PrismaClient; // TODO: not shure this run
  }

  async execute(command: DowloadFolder) {
    const folderId = command.id;
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

    // =========================== Build zip ===========================
    const zipped = await this.diskStorage.buildZipAsync(folder.name, child);
    return zipped;
  }
}
