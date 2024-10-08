import {
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { z } from 'zod';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { FileRef, StorageEvent, UUID } from 'src/domain';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClientProxy } from '@nestjs/microservices';

export const Rename = z.object({
  label: z.literal('rename'),
  name: z.string(),
});
export const Archive = z.object({ label: z.literal('archive') });
export const Pin = z.object({ label: z.literal('pin') });
export const Unpin = z.object({ label: z.literal('unpin') });
export const Unarchive = z.object({ label: z.literal('unarchive') });

type Rename = z.infer<typeof Rename>;
type Archive = z.infer<typeof Archive>;
type Pin = z.infer<typeof Pin>;
type Unpin = z.infer<typeof Unpin>;
type Unarchive = z.infer<typeof Unarchive>;

export const UpdateItemDTO = z.union([Rename, Archive, Pin, Unpin, Unarchive]);
export type UpdateItemDTO = z.infer<typeof UpdateItemDTO>;

export class FileUpdateCmd implements ICommand {
  public readonly method: UpdateItemDTO;
  public readonly accessorId: string;
  public readonly fileId: string;
  constructor(method: UpdateItemDTO, accessorId: string, fileId: string) {
    try {
      this.method = UpdateItemDTO.parse(method);
      this.accessorId = accessorId;
      this.fileId = UUID.parse(fileId);
    } catch (err) {
      if (err instanceof Error) {
        const msg = `${FileUpdateCmd.name}: invalid input ${err.message}`;
        throw new Error(msg);
      }
      throw err;
    }
  }
}
@CommandHandler(FileUpdateCmd)
export class FileUpdateHandler {
  private readonly tx = this.txHost.tx;
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    @Inject('StorageQueue') private readonly storageQueue: ClientProxy,
  ) {}

  @Transactional()
  async execute({ method, accessorId, fileId }: FileUpdateCmd) {
    const file = await this.tx.fileRef.findUnique({
      where: { id: fileId },
      include: { folder: true },
    });
    if (!file) throw new BadRequestException("File doesn't exist");
    if (file.ownerId !== accessorId)
      throw new ForbiddenException('Permission denied');

    switch (method.label) {
      case 'rename':
        await this.rename(file, method.name);
        break;
      case 'archive':
        await this.archive(file);
        break;
      case 'unarchive':
        await this.unarchive(file);
        break;
      case 'pin':
        await this.pin(file);
        break;
      case 'unpin':
        await this.unpin(file);
        break;
      default:
        throw new Error('Invalid update label');
    }

    const folder = await this.tx.folder.findUniqueOrThrow({
      where: { id: file.folder?.folderId },
    });
    const rootId = folder.rootId ?? folder.id;

    const event = new StorageEvent({
      type: 'file_updated',
      data: FileRef.parse(file),
    });
    await this.storageQueue.emit(`storage.${rootId}`, event);
  }

  async rename(file: { id: string }, name: string) {
    const data = { name, updatedAt: new Date() };
    await this.tx.fileRef.update({ where: { id: file.id }, data });
    Object.assign(file, data);
  }

  async archive(file: { id: string }) {
    const data = { archivedAt: new Date(), updatedAt: new Date() };
    await this.tx.fileRef.update({ where: { id: file.id }, data });
    Object.assign(file, data);
  }

  async unarchive(file: { id: string }) {
    const data = { archivedAt: null, updatedAt: new Date() };
    await this.tx.fileRef.update({ where: { id: file.id }, data });
    Object.assign(file, data);
  }

  async pin(file: { id: string }) {
    const data = { pinnedAt: new Date(), updatedAt: new Date() };
    await this.tx.fileRef.update({ where: { id: file.id }, data });
    Object.assign(file, data);
  }

  async unpin(file: { id: string }) {
    const data = { pinnedAt: null, updatedAt: new Date() };
    await this.tx.fileRef.update({ where: { id: file.id }, data });
    Object.assign(file, data);
  }
}
