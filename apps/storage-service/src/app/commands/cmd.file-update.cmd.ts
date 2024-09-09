import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { TransactionHost } from '@nestjs-cls/transactional';

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

export class FileUpdate implements ICommand {
  constructor(
    public readonly method: UpdateItemDTO,
    public readonly accessorId: string,
    public readonly fileId: string,
  ) {}
}
@CommandHandler(FileUpdate)
export class FileUpdateHandler {
  private readonly tx: PrismaClient;
  constructor(private readonly txHost: TransactionHost) {
    this.tx = this.txHost.tx as PrismaClient; // TODO: not shure this run
  }

  async execute({ method, accessorId, fileId }: FileUpdate) {
    const file = await this.tx.fileRef.findUnique({ where: { id: fileId } });
    if (!file) throw new BadRequestException("File doesn't exist");
    if (file.ownerId !== accessorId)
      throw new ForbiddenException('Permission denied');

    switch (method.label) {
      case 'rename':
        return this.rename(file, method.name);
      case 'archive':
        return this.archive(file);
      case 'unarchive':
        return this.unarchive(file);
      case 'pin':
        return this.pin(file);
      case 'unpin':
        return this.unpin(file);
      default:
        throw new Error('Invalid update label');
    }
  }

  async rename(file: { id: string }, name: string) {
    return this.tx.fileRef.update({ where: { id: file.id }, data: { name } });
  }

  async archive(file: { id: string }) {
    await this.tx.fileRef.update({
      where: { id: file.id },
      data: { archivedAt: new Date() },
    });
  }

  async unarchive(file: { id: string }) {
    await this.tx.fileRef.update({
      where: { id: file.id },
      data: { archivedAt: null },
    });
  }

  async pin(file: { id: string }) {
    await this.tx.fileRef.update({
      where: { id: file.id },
      data: { pinnedAt: new Date() },
    });
  }

  async unpin(file: { id: string }) {
    await this.tx.fileRef.update({
      where: { id: file.id },
      data: { pinnedAt: null },
    });
  }
}
