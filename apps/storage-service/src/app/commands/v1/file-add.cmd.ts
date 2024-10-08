import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';

import { FileRef, StorageEvent, UUID } from 'src/domain';

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
  private readonly tx = this.txHost.tx;
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    @Inject('StorageQueue') private readonly storageQueue: ClientProxy,
  ) {}

  @Transactional()
  async execute(command: FileAddCmd) {
    const { folderId, item } = command;
    const folder = await this.tx.folder.findUniqueOrThrow({
      select: { id: true, rootId: true },
      where: { id: folderId },
    });
    await this.tx.fileRef.create({ data: item });
    await this.tx.fileInFolder.create({
      data: { folderId: folder.id, fileId: item.id },
    });

    const rootId = folder.rootId ?? folder.id;
    const event = new StorageEvent({ type: 'file_added', data: item });
    await this.storageQueue.emit(`storage.${rootId}`, event);
  }
}
