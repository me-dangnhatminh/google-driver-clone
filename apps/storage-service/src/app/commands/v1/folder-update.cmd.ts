import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';

import { Folder, StorageEvent, UUID } from 'src/domain';

import { UpdateItemDTO } from './file-update.cmd';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClientProxy } from '@nestjs/microservices';

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
  private readonly tx = this.txHost.tx;
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    @Inject('StorageQueue') private readonly storageQueue: ClientProxy,
  ) {}

  @Transactional()
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
        await this.rename(item, method.name);
        break;
      case 'archive':
        await this.archive(item);
        break;
      case 'unarchive':
        await this.unarchive(item);
        break;
      case 'pin':
        await this.pin(item);
        break;
      case 'unpin':
        await this.unpin(item);
        break;
      default:
        throw new Error('Invalid update label');
    }
    const event = new StorageEvent({ type: 'folder_updated', data: item });
    const rootId = item.rootId ?? item.id;
    await this.storageQueue.emit(`storage.${rootId}`, event);
  }
  async rename(item: Folder, name: string) {
    const data = { name, updatedAt: new Date() };
    await this.tx.folder.update({ where: { id: item.id }, data });
    Object.assign(item, data);
  }

  async archive(item: Folder) {
    if (item.archivedAt) throw new ConflictException('Folder already archived');
    if (!item.rootId) throw new BadRequestException('Root cannot be archived');
    const data = { archivedAt: new Date() };
    await this.tx.folder.updateMany({
      where: {
        rootId: item.rootId,
        lft: { gte: item.lft },
        rgt: { lte: item.rgt },
      },
      data,
    });
    Object.assign(item, data);
  }

  async unarchive(item: Folder) {
    if (!item.archivedAt) throw new BadRequestException('Folder not archived');
    if (!item.rootId) throw new BadRequestException('Root cannot be archived');
    const data = { archivedAt: null };
    await this.tx.folder.updateMany({
      where: {
        rootId: item.rootId,
        lft: { gte: item.lft },
        rgt: { lte: item.rgt },
      },
      data,
    });
    Object.assign(item, data);
  }

  async pin(item: Folder) {
    if (item.pinnedAt) throw new BadRequestException('Folder already pinned');
    if (!item.rootId) throw new BadRequestException('Root cannot be archived');
    const data = { pinnedAt: new Date(), updatedAt: new Date() };
    await this.tx.folder.update({ where: { id: item.id }, data });
    Object.assign(item, data);
  }

  async unpin(item: Folder) {
    if (!item.pinnedAt) throw new BadRequestException('Folder not pinned');
    if (!item.rootId) throw new BadRequestException('Root cannot be archived');
    const data = { pinnedAt: null, updatedAt: new Date() };
    await this.tx.folder.update({ where: { id: item.id }, data });
    Object.assign(item, data);
  }
}
