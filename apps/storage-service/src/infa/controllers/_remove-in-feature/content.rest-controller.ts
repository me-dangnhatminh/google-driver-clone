import { TransactionHost } from '@nestjs-cls/transactional';
import {
  Controller,
  Get,
  NotFoundException,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import * as ORM from '@prisma/client';
import * as fs from 'fs-extra';
import * as sharp from 'sharp';
import { Response } from 'express';

import { fileUtil } from 'src/common';

import { useZodPipe } from 'src/infa/pipes';
import { DiskStorageService } from '../../adapters';
import { Authenticated } from '@app/auth-client';

const SizeFormat = z.string().regex(/^[1-9]\d{2,3}x[1-9]\d{2,3}$/, {
  message: 'Invalid size format',
});
const SizeTransform = (size: string) => {
  const [width, height] = size.split('x').map((s) => parseInt(s));
  return { width, height };
};
const GetContentQuery = z.object({
  id: z.string().uuid(),
  type: z.literal('file'),
  size: SizeFormat.optional(),
  export: z.enum(['download', 'view']).default('view'),
});
type GetContentQuery = z.infer<typeof GetContentQuery>;

@Controller({ path: 'storage/content', version: '1' })
@UseGuards(Authenticated)
export class ContentRestController {
  constructor(
    private readonly txHost: TransactionHost,
    private readonly storageDisk: DiskStorageService,
  ) {}

  @Get()
  async getContent(
    @Query(useZodPipe(GetContentQuery)) query: GetContentQuery,
    @Res() res: Response,
  ) {
    // const accesorId = UUID.parse(req.user.id, { path: ['user.id'] });
    const tx = this.txHost.tx as ORM.PrismaClient;

    if (query.type == 'file') {
      const file = await tx.fileRef.findUnique({ where: { id: query.id } });
      if (!file) throw new NotFoundException('File not found');
      // if (file.ownerId !== accesorId) {
      //   throw new ForbiddenException('Permission denied to access this file');
      // } // TODO: Uncomment this line, fix in client
      return this.fileHandler(file, res, query.size);
    }
    return query;
  }

  public async fileHandler(fileRef: ORM.FileRef, res: Response, size?: string) {
    const filePath = this.storageDisk.filePath(fileRef.id);
    if (!filePath.isExists) {
      throw new NotFoundException({ code: 'file.not_found', id: fileRef.id });
    }
    const isImage = fileUtil.isImg(fileRef.contentType);
    if (!isImage) {
      const stream = fs.createReadStream(filePath.fullPath);
      const filename = fileUtil.formatAndEncode(fileRef.name);
      return new StreamableFile(stream, {
        disposition: `attachment; filename="${filename}"`,
        type: fileRef.contentType,
      });
    }

    const image = sharp(filePath.fullPath);
    if (size) {
      const { width, height } = SizeTransform(size);
      image.resize(width, height);
    }
    image.pipe(res);
    res.setHeader('Access-Control-Expose-Headers', [
      'Content-Disposition',
      'Content-Type',
    ]);
    return res;
  }
}
