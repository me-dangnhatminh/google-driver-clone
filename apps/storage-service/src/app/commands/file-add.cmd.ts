import { TransactionHost } from '@nestjs-cls/transactional';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PrismaClient } from '@prisma/client';

import { FileRef } from 'src/domain';

export class FileAdd implements ICommand {
  constructor(
    public readonly folderId: string,
    public readonly item: FileRef,
  ) {}
}
@CommandHandler(FileAdd)
export class FileAddHandler implements ICommandHandler<FileAdd> {
  private readonly tx: PrismaClient;
  constructor(private readonly txHost: TransactionHost) {
    this.tx = this.txHost.tx as PrismaClient; // TODO: not shure this run
  }

  async execute(command: FileAdd) {
    const { folderId, item } = command;
    const folder = await this.tx.folder.findUnique({ where: { id: folderId } });
    if (!folder) throw new Error('Folder not found');
    await this.saveFileRef(item, folder);
  }

  private async saveFileRef(item: FileRef, folder: any) {
    await this.tx.fileRef.create({ data: item });
    await this.tx.fileInFolder.create({
      data: { folderId: folder.id, fileId: item.id },
    });
  }
}
