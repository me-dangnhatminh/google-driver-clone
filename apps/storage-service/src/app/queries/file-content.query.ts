import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import * as fs from 'fs-extra';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaClient, FileRef } from '@prisma/client';

import { fileUtil } from 'src/common';
import { diskStorage } from 'src/app/services';

export class FileContent implements IQuery {
  constructor(
    public readonly fileId: string,
    public readonly asscessorId: string,
  ) {}
}

@QueryHandler(FileContent)
export class FileContentHandler implements IQueryHandler<FileContent> {
  private readonly tx: PrismaClient;
  constructor(private readonly txHost: TransactionHost) {
    this.tx = this.txHost.tx as PrismaClient; // TODO: not shure this run
  }

  async execute({ fileId, asscessorId }: FileContent) {
    const file = await this.tx.fileRef.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId !== asscessorId)
      throw new ForbiddenException('Permission denied');

    const fullpath = diskStorage.getFullPath(fileId);
    if (!fullpath) {
      this.hardRemoveFile(file);
      throw new NotFoundException('File not found');
    }

    const stream = fs.createReadStream(fullpath);
    let filename = fileUtil.formatName(file.name);
    filename = encodeURIComponent(filename);
    return new StreamableFile(stream, {
      disposition: `attachment; filename="${filename}"`,
      type: file.contentType,
    });
  }

  private hardRemoveFile(item: FileRef) {
    const remove = this.tx.fileRef.delete({ where: { id: item.id } });
    const removeInFolder = this.tx.fileInFolder.deleteMany({
      where: { fileId: item.id },
    });
    return Promise.all([remove, removeInFolder]).then(() => {});
  }
}
