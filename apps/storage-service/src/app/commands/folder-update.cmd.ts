import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PrismaClient } from '@prisma/client';
import { TransactionHost } from '@nestjs-cls/transactional';

import { Folder, UUID } from 'src/domain';

import { UpdateItemDTO } from './file-update.cmd';

export class FolderUpdateCmd implements ICommand {
  constructor(
    public readonly method: UpdateItemDTO,
    public readonly folderId: string,
    public readonly accessorId: string,
  ) {
    try {
      UpdateItemDTO.parse(method);
      UUID.parse(folderId);
    } catch (error) {
      if (error instanceof Error) {
        const msg = `${FolderUpdateCmd.name}: invalid input ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }
}
@CommandHandler(FolderUpdateCmd)
export class FolderUpdateHandler implements ICommandHandler<FolderUpdateCmd> {
  private readonly tx: PrismaClient;
  constructor(private readonly txHost: TransactionHost) {
    this.tx = this.txHost.tx as PrismaClient; // TODO: not shure this run
  }

  async execute({ method, folderId, accessorId }: FolderUpdateCmd) {
    const folder = await this.tx.folder.findUnique({ where: { id: folderId } });
    if (!folder) throw new BadRequestException('Folder not found');
    if (folder.ownerId !== accessorId)
      throw new ForbiddenException('Permission denied');
    if (!folder.rootId)
      throw new BadRequestException("Can't update root folder");
    const item = folder as unknown as Folder; // TODO: fix this
    switch (method.label) {
      case 'rename':
        return this.rename(item, method.name);
      case 'archive':
        return this.archive(item);
      case 'unarchive':
        return this.unarchive(item);
      case 'pin':
        return this.pin(item);
      case 'unpin':
        return this.unpin(item);
      default:
        throw new Error('Invalid update label');
    }
  }
  async rename(item: Folder, name: string) {
    return this.tx.folder.update({ where: { id: item.id }, data: { name } });
  }

  async archive(item: Folder) {
    if (item.archivedAt) throw new ConflictException('Folder already archived');
    if (!item.rootId) throw new BadRequestException('Root cannot be archived');
    await this.tx.folder.updateMany({
      where: {
        rootId: item.rootId,
        lft: { gte: item.lft },
        rgt: { lte: item.rgt },
      },
      data: { archivedAt: new Date() },
    });
  }

  async unarchive(item: Folder) {
    if (!item.archivedAt) throw new BadRequestException('Folder not archived');
    if (!item.rootId) throw new BadRequestException('Root cannot be archived');
    await this.tx.folder.updateMany({
      where: {
        rootId: item.rootId,
        lft: { gte: item.lft },
        rgt: { lte: item.rgt },
      },
      data: { archivedAt: null },
    });
  }

  async pin(item: Folder) {
    if (item.pinnedAt) throw new BadRequestException('Folder already pinned');
    if (!item.rootId) throw new BadRequestException('Root cannot be archived');
    await this.tx.folder.update({
      where: { id: item.id },
      data: { pinnedAt: new Date() },
    });
  }

  async unpin(item: Folder) {
    if (!item.pinnedAt) throw new BadRequestException('Folder not pinned');
    if (!item.rootId) throw new BadRequestException('Root cannot be archived');
    await this.tx.folder.update({
      where: { id: item.id },
      data: { pinnedAt: null },
    });
  }
}
