import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaClient } from '@prisma/client';

import { FileRef, UUID } from 'src/domain';

export class FileUploadCmd implements ICommand {
  public readonly rootId: string;
  public readonly folderId: string;
  public readonly accssorId: string;
  public readonly item: FileRef;
  constructor(
    rootId: string,
    folderId: string,
    accssorId: string,
    item: Partial<FileRef>,
  ) {
    try {
      this.rootId = UUID.parse(rootId);
      this.folderId = UUID.parse(folderId);
      this.accssorId = accssorId;
      this.item = FileRef.parse(item);
    } catch (err) {
      if (err instanceof Error) {
        const msg = `${FileUploadCmd.name}: invalid input ${err.message}`;
        throw new Error(msg);
      }
      throw err;
    }
  }
}

@CommandHandler(FileUploadCmd)
export class FileUploadHandler implements ICommandHandler {
  private readonly tx: PrismaClient;
  constructor(private readonly txHost: TransactionHost) {
    this.tx = this.txHost.tx as PrismaClient; // TODO: not shure this run
  }

  async execute(command: FileUploadCmd) {
    const { item, folderId, rootId } = command;
    const folder = await this.tx.folder.findUnique({ where: { id: folderId } });
    if (!folder) throw new NotFoundException(`Folder not found`);
    if (folder.archivedAt) throw new BadRequestException(`Folder is archived`);
    const isOwner = folder.ownerId === command.accssorId;
    if (!isOwner) {
      throw new ForbiddenException(`You don't have permission to upload file`);
    }

    const task1 = this.tx.fileRef.create({ data: item });
    const task2 = this.tx.fileInFolder.create({
      data: { folderId, fileId: item.id },
    });

    const task3 = this.tx.folder.update({
      where: { id: rootId },
      data: { size: { increment: item.size }, modifiedAt: new Date() },
    });
    await Promise.all([task1, task2, task3]);
  }
}
