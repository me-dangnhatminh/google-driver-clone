import { FileRef, FolderInfo, UUID } from 'src/domain';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Transactional } from '@nestjs-cls/transactional';
import {
  FileFieldsInterceptor as FileFields,
  FileInterceptor as FileField,
} from '@nestjs/platform-express';
import { randomUUID as uuid } from 'crypto';
import * as z from 'zod';
import { Response } from 'express';

import {
  FileUpdateCmd,
  FileUploadCmd,
  AddFolderCmd,
  FolderCreateCmd,
  FolderUpdateCmd,
  HardDeleteItemCmd,
  FileContentQuery,
  FolderContentQuery,
  FolderDownloadQuery,
  ItemLabel,
  UpdateItemDTO,
  ItemHardDelete,
  FolderCreateDTO,
  Pagination,
} from 'src/app';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as rx from 'rxjs';

import { fileUtil, StorageRoutes } from 'src/common';

import { Authenticated, HttpUser } from 'lib/auth-client';
import {
  STORAGE_SERVICE_NAME,
  HttpStorage,
  StorageLoaded,
} from 'lib/storage-client';

import { useZodPipe } from '../pipes';
import { DiskStorageService } from '../adapters';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { Readable } from 'stream';

const RootOrKey = z.union([z.literal('root'), UUID]);
type RootOrKey = Omit<string, 'root'> | 'root';

@Controller()
@UseGuards(Authenticated, StorageLoaded)
export class StorageRestController {
  private readonly fileService: any;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly storageService: DiskStorageService,
    @Inject(STORAGE_SERVICE_NAME)
    private readonly client: ClientGrpcProxy,
  ) {
    this.fileService = client.getService('FileService');
  }

  @Get(StorageRoutes.STORAGE_DETAIL)
  @Transactional()
  storageDetail(@HttpStorage() storage) {
    return {
      name: 'My Storage',
      used: storage.used,
      total: storage.total,
    };
  }

  @Delete(StorageRoutes.DELETE_ITEM)
  @Transactional()
  async deleteItem(
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(UUID)) key: string,
    @Query('type', useZodPipe(ItemHardDelete.shape.type))
    type: ItemHardDelete['type'],
  ) {
    const cmd = new HardDeleteItemCmd(rootId, { type, id: key });
    await this.commandBus.execute(cmd);
  }

  // ================================================== //
  // File controller                                    //
  // ================================================== //
  @Post(StorageRoutes.FILE_UPLOAD)
  @UseInterceptors(FileField('file'))
  @Transactional()
  async fileUpload(
    @HttpUser('sub') userId: string,
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ) {
    const stream = fs.createReadStream(path.resolve(file.path));
    console.log('File upload', file);

    const content = new rx.Observable<string | Buffer>((subscriber) => {
      stream.on('data', (chunk) => {
        subscriber.next(chunk);
      });
      stream.on('end', () => {
        subscriber.complete();
      });
      stream.on('error', (error) => {
        subscriber.error(error);
      });
    });

    const uploadStream = this.fileService.uploadFile({
      content,
      fileId: file.filename,
      offset: 0,
    });

    uploadStream.subscribe({
      next: (chunk) => {
        console.log('Received chunk', chunk);
      },
      complete: () => {
        console.log('Upload completed');
      },
      error: (err) => {
        console.error(err);
      },
    });

    return uploadStream.toPromise();
    // wait for the upload to complete

    // uploadStream.subscribe({
    //   next: (chunk) => {
    //     console.log('Received chunk', chunk);
    //   },
    //   complete: () => {
    //     console.log('Upload completed');
    //   },
    //   error: (err) => {
    //     console.error(err);
    //   },
    // });
    // const folderId = UUID.parse(key === 'root' ? rootId : key);
    // const cmd = new FileUploadCmd(rootId, folderId, userId, {
    //   id: file.filename,
    //   name: file.originalname,
    //   size: file.size,
    //   contentType: file.mimetype,
    //   ownerId: userId,
    // });
    // await this.commandBus.execute(cmd);
  }

  @Get(StorageRoutes.FILE_DOWNLOAD)
  @Transactional()
  async fileDownload(
    @HttpUser('sub') userId: string,
    @Param('key', useZodPipe(UUID)) fileKey: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const query = new FileContentQuery(fileKey, userId);
    const result: FileRef = await this.queryBus.execute(query);

    let filename: string = result.name;
    const contentType: string = result.contentType;
    const filePath = this.storageService.filePath(fileKey);
    if (!filePath.isExists || !filename) {
      throw new Error('File not found: please contact admin');
    }

    const stream = fs.createReadStream(filePath.fullPath);
    filename = fileUtil.formatName(filename);
    filename = encodeURIComponent(filename);
    res.setHeader('Access-Control-Expose-Headers', [
      'Content-Disposition',
      'Content-Type',
    ]);

    return new StreamableFile(stream, {
      disposition: `attachment; filename="${filename}"`,
      type: contentType,
    });
  }

  @Patch(StorageRoutes.FILE_UPDATE)
  @Transactional()
  async fileUpdate(
    @HttpUser('sub') userId: string,
    @Param('key', useZodPipe(UUID)) key: string,
    @Body(useZodPipe(UpdateItemDTO)) dto: UpdateItemDTO,
  ) {
    const fileId: string = key;
    const cmd = new FileUpdateCmd(dto, userId, fileId);
    await this.commandBus.execute(cmd);
  }

  // ================================================== //
  // Folder controller                                  //
  // ================================================== //
  @Get(StorageRoutes.FOLDER_DETAIL)
  @Transactional()
  async getFolder(
    @HttpUser('sub') userId: string,
    @HttpStorage('refId') rootId: string,
    @Query('label', useZodPipe(ItemLabel)) label: ItemLabel,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
    @Query(useZodPipe(Pagination)) pagination: Pagination,
  ) {
    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const query = new FolderContentQuery(
      rootId,
      label,
      folderId,
      userId,
      pagination,
    );
    return await this.queryBus.execute(query);
  }

  @Post(StorageRoutes.FOLDER_CREATE)
  @Transactional()
  async folderCreate(
    @HttpUser('sub') userId: string,
    @HttpStorage('refId') rootId: string,
    @Body(useZodPipe(FolderCreateDTO)) dto: FolderCreateDTO,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
  ) {
    const accssorId = userId;
    const folderId = UUID.parse(key === 'root' ? rootId : key);
    dto['ownerId'] = userId;
    const item = FolderInfo.parse({ ...dto, id: uuid(), size: 0 });
    const cmd = new FolderCreateCmd(folderId, item, accssorId);
    await this.commandBus.execute(cmd);
  }

  @Get(StorageRoutes.FOLDER_DOWNLOAD)
  @Transactional()
  async downloadFolder(
    @Param('key', useZodPipe(UUID)) folderId: string,
    @Res() res: Response,
  ) {
    const query = new FolderDownloadQuery(folderId);
    const { name, flatContent } = await this.queryBus.execute(query);
    const zipped = await this.storageService.buildZipAsync(name, flatContent);
    const zip = zipped.zip;
    const filename = zipped.foldername;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Length', zipped.totalSize);
    res.setHeader('Access-Control-Expose-Headers', [
      'Content-Disposition',
      'Content-Type',
    ]);
    return zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(res);
  }

  @Patch(StorageRoutes.FOLDER_UPDATE)
  @Transactional()
  async folderUpdate(
    @HttpUser('sub') userId: string,
    @Param('key', useZodPipe(UUID)) folderId: string,
    @Body(useZodPipe(UpdateItemDTO)) dto: UpdateItemDTO,
  ) {
    const cmd = new FolderUpdateCmd(dto, folderId, userId);
    await this.commandBus.execute(cmd);
  }

  @Post(StorageRoutes.FOLDER_UPLOAD)
  @UseInterceptors(FileFields([{ name: 'files' }], { preservePath: true }))
  @Transactional()
  async folderUpload(
    @HttpUser('sub') userId: string,
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true }))
    upload: { files: Express.Multer.File[] },
  ) {
    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const cmd = new AddFolderCmd(folderId, userId, upload.files);
    await this.commandBus.execute(cmd);
  }
}
