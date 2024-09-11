import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaClient, FileRef } from '@prisma/client';
import { UUID } from 'src/domain';

export class FileContentQuery implements IQuery {
  constructor(
    public readonly fileId: string,
    public readonly asscessorId: string,
  ) {
    try {
      UUID.parse(fileId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `${FileContentQuery.name}: invalid input ${error.message}`,
        );
      }
      throw error;
    }
  }
}

export type IFileContentHandler = IQueryHandler<FileContentQuery, FileRef>;
@QueryHandler(FileContentQuery)
export class FileContentHandler implements IFileContentHandler {
  private readonly tx: PrismaClient;
  constructor(private readonly txHost: TransactionHost) {
    this.tx = this.txHost.tx as PrismaClient; // TODO: not shure this run
  }

  async execute({ fileId, asscessorId }: FileContentQuery) {
    const file = await this.tx.fileRef.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId !== asscessorId)
      throw new ForbiddenException('Permission denied');
    return file;
  }

  private hardRemoveFile(item: FileRef) {
    const remove = this.tx.fileRef.delete({ where: { id: item.id } });
    const removeInFolder = this.tx.fileInFolder.deleteMany({
      where: { fileId: item.id },
    });
    return Promise.all([remove, removeInFolder]).then(() => {});
  }
}
