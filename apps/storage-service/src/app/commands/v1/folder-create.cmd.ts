import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import * as z from 'zod';

import { FolderInfo, PastTime, StorageEvent, UUID } from 'src/domain';
import { AppError } from 'src/common';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClientProxy } from '@nestjs/microservices';

export const FolderCreateDTO = z.object({
  name: z.string(),
  createdAt: PastTime.default(new Date()),
  pinnedAt: PastTime.nullable().default(null),
  modifiedAt: PastTime.nullable().default(null),
  archivedAt: PastTime.nullable().default(null),
});
export type FolderCreateDTO = z.infer<typeof FolderCreateDTO>;

export class FolderCreateCmd implements ICommand {
  constructor(
    public readonly folderId: string,
    public readonly item: FolderInfo,
    public readonly accssorId: string,
  ) {
    try {
      UUID.parse(folderId);
      FolderInfo.parse(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const msg = error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        throw new AppError({
          type: 'invalid_request',
          code: 'invalid_input',
          message: msg,
        });
      }

      if (error instanceof Error) {
        const msg = `${FolderCreateCmd.name}: invalid input ${error.message}`;
        throw new AppError({
          type: 'invalid_request',
          code: 'invalid_input',
          message: msg,
        });
      }
      throw error;
    }
  }
}

@CommandHandler(FolderCreateCmd)
export class FolderCreateHandler implements ICommandHandler<FolderCreateCmd> {
  private readonly tx = this.txHost.tx;
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    @Inject('StorageQueue') private readonly storageQueue: ClientProxy,
  ) {}

  @Transactional()
  async execute(command: FolderCreateCmd) {
    const item = command.item;
    const folder = await this.tx.folder.findUnique({
      where: { id: command.folderId, archivedAt: null },
    });
    if (!folder) throw new NotFoundException('Folder not found');
    if (folder.archivedAt) throw new BadRequestException('Folder is archived');
    if (folder.ownerId !== command.accssorId)
      throw new ForbiddenException('User not owner of folder');
    const tasks: Promise<unknown>[] = [];
    const rootId = folder.rootId ?? folder.id;
    // extend root
    tasks.push(
      this.tx.folder.update({
        where: { id: rootId, lft: 0, depth: 0 },
        data: { rgt: { increment: 2 } },
      }),
    );

    // extend right siblings
    const isRoot = folder.rootId === folder.id;
    if (!isRoot) {
      tasks.push(
        this.tx.folder.updateMany({
          where: { rootId, rgt: { gte: folder.rgt } },
          data: { rgt: { increment: 2 } },
        }),
        this.tx.folder.updateMany({
          where: { rootId, lft: { gt: folder.rgt } },
          data: { lft: { increment: 2 } },
        }),
      );
    }

    const createdAt = new Date();
    tasks.push(
      this.tx.folder.create({
        data: {
          id: item.id,
          name: item.name,
          size: 0,
          createdAt: createdAt,
          modifiedAt: createdAt,
          ownerId: item.ownerId,
          archivedAt: null,
          pinnedAt: null,
          rootId: rootId,
          parentId: folder.id,
          lft: folder.rgt,
          rgt: folder.rgt + 1,
          depth: folder.depth + 1,
        },
      }),
    );

    await Promise.all(tasks);
    const event = new StorageEvent({ type: 'folder_created', data: item });
    await this.storageQueue.emit(`storage.${rootId}`, event);
  }
}
