import { TransactionHost } from '@nestjs-cls/transactional';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PrismaClient } from '@prisma/client';

import { FileRef, UUID } from 'src/domain';

export class FileAddCmd implements ICommand {
  public readonly folderId: string;
  public readonly item: FileRef;
  constructor(folderId: string, item: Partial<FileRef>) {
    try {
      this.folderId = UUID.parse(folderId);
      this.item = FileRef.parse(item);
    } catch (err) {
      if (err instanceof Error) {
        const msg = `${FileAddCmd.name}: invalid input ${err.message}`;
        throw new Error(msg);
      }
      throw err;
    }
  }
}
@CommandHandler(FileAddCmd)
export class FileAddHandler implements ICommandHandler<FileAddCmd> {
  private readonly tx: PrismaClient;
  constructor(private readonly txHost: TransactionHost) {
    this.tx = this.txHost.tx as PrismaClient; // TODO: not shure this run
  }

  async execute(command: FileAddCmd) {
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
