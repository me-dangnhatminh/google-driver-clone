import {
  BadRequestException,
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
  Req,
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
import { Response } from 'express';

import {
  FileUpdateCmd,
  FileUploadCmd,
  FileContentQuery,
  FolderDownloadQuery,
  FolderAddContentCmd,
  AddFolderCmd,
  ItemLabel,
  UpdateItemDTO,
  ItemHardDelete,
  FolderCreateDTO,
  Pagination,
} from 'src/app';

import * as grpc from '@grpc/grpc-js';
import * as fs from 'fs-extra';
import * as rx from 'rxjs';
import * as z from 'zod';

import { Authenticated, HttpUser } from 'libs/auth-client';
import { HttpStorage, StorageLoaded, toGB } from 'libs/storage-client';
import { PlanLoadedGuard } from 'libs/payment-client';

import { FileRef, UUID } from 'src/domain';
import { fileUtil, StorageRoutes } from 'src/common';

import { useZodPipe } from '../pipes';
import {
  buildStructure,
  DiskStorageService,
  structureToDoamin,
  totalSize,
} from '../adapters';

const RootOrKey = z.union([z.literal('root'), UUID]);
type RootOrKey = Omit<string, 'root'> | 'root';

@Controller()
@UseGuards(Authenticated, StorageLoaded)
export class StorageRestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly diskStorageService: DiskStorageService,
    @Inject('StorageService') private readonly storageService,
  ) {}

  @Get(StorageRoutes.STORAGE_DETAIL)
  @UseGuards(PlanLoadedGuard)
  myStorage(@Req() req) {
    const storage = req.storage;
    const plan = req.plan;
    return {
      name: 'My Storage',
      used: storage.used,
      plan: plan.name,
      total: toGB(plan.metadata.my_storage) * 1024 * 1024 * 1024, // TODO: Fix this
    };
  }

  @Get(StorageRoutes.FOLDER_DETAIL)
  getFolder(
    @HttpUser('id') userId: string,
    @HttpStorage('refId') rootId: string,
    @Query('label', useZodPipe(ItemLabel)) label: ItemLabel,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
    @Query(useZodPipe(Pagination)) pagination: Pagination,
  ) {
    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const meta = new grpc.Metadata();
    meta.add('accessorId', userId);
    const get = this.storageService.getFolder(
      { rootId, label, folderId, pagination },
      meta,
    );
    return rx.lastValueFrom(get).then((res) => {
      return res;
    });
  }

  @Post(StorageRoutes.FOLDER_CREATE)
  createFolder(
    @HttpUser('id') userId: string,
    @HttpStorage('refId') rootId: string,
    @Body(useZodPipe(FolderCreateDTO)) dto: FolderCreateDTO,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
  ) {
    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const meta = new grpc.Metadata();
    meta.add('accessorId', userId);
    const item = { id: uuid(), ownerId: userId, ...dto };
    const fetch = this.storageService.createFolder({ folderId, item }, meta);
    return rx.lastValueFrom(fetch);
  }

  @Patch(StorageRoutes.FOLDER_UPDATE)
  updateFolder(
    @HttpUser('id') userId: string,
    @Body(useZodPipe(UpdateItemDTO)) dto: UpdateItemDTO,
    @Param('key', useZodPipe(UUID)) folderId: string,
  ) {
    const meta = new grpc.Metadata();
    meta.add('accessorId', userId);
    const fetch = this.storageService.updateFolder(
      { folderId, method: dto },
      meta,
    );
    return rx.lastValueFrom(fetch);
  }

  @Delete(StorageRoutes.DELETE_ITEM)
  async deleteItem(
    @HttpUser('id') userId: string,
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(UUID)) key: string,
    @Query('type', useZodPipe(ItemHardDelete.shape.type))
    type: ItemHardDelete['type'],
  ) {
    const meta = new grpc.Metadata();
    meta.add('accessorId', userId);
    await rx.lastValueFrom(
      this.storageService.hardDeleteItem({ rootId, id: key, type }, meta),
    );
  }

  // ========================== OTHER ========================== //

  // ================================================== //
  // File controller                                    //
  // ================================================== //
  @Post(StorageRoutes.FILE_UPLOAD)
  @UseGuards(PlanLoadedGuard)
  @UseInterceptors(FileField('file'))
  @Transactional()
  async fileUpload(
    @Req() req,
    @HttpUser('sub') userId: string,
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ) {
    const storage = req.storage;
    const plan = req.plan;
    const used = storage.used;
    const total = toGB(plan.metadata.my_storage) * 1024 * 1024 * 1024; // TODO: Fix this
    if (total - used < file.size) {
      const msg = `Storage limit exceeded: free ${total - used}, but file size is ${file.size}`;
      throw new BadRequestException(msg);
    }

    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const cmd = new FileUploadCmd(rootId, folderId, userId, {
      id: file.filename,
      name: file.originalname,
      size: file.size,
      contentType: file.mimetype,
      ownerId: userId,
    });

    await this.commandBus.execute(cmd);
  }

  @Post(StorageRoutes.FILE_UPLOADS)
  @UseGuards(PlanLoadedGuard)
  @UseInterceptors(FileFields([{ name: 'files' }], { preservePath: true }))
  @Transactional()
  async fileUploads(
    @Req() req,
    @HttpUser('sub') userId: string,
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true }))
    upload: { files: Express.Multer.File[] },
  ) {
    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const check = this.checkFreeSpace(req, upload.files);
    if (check.isFree) {
      const msg = `Storage limit exceeded: free ${check.free}, but file size is ${check.upload}`;
      throw new BadRequestException(msg);
    }

    const tree = buildStructure(upload.files);
    const folder = await this.storageService
      .getFolderInfo({ folderId })
      .toPromise();

    const uploaded = structureToDoamin(tree, folder, userId);

    const cmd = new FolderAddContentCmd({
      accessorId: userId,
      folderId: folderId,
      content: uploaded,
    });

    await this.commandBus.execute(cmd);

    // throw new BadRequestException('Not implemented');
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
    const filePath = this.diskStorageService.filePath(fileKey);
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

  @Get(StorageRoutes.FOLDER_DOWNLOAD)
  @Transactional()
  async downloadFolder(
    @Param('key', useZodPipe(UUID)) folderId: string,
    @Res() res: Response,
  ) {
    const query = new FolderDownloadQuery(folderId);
    const { name, flatContent } = await this.queryBus.execute(query);
    const zipped = this.diskStorageService.buildZipSync(name, flatContent);
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

  @Post(StorageRoutes.FOLDER_UPLOAD)
  @UseGuards(PlanLoadedGuard)
  @UseInterceptors(FileFields([{ name: 'files' }], { preservePath: true }))
  @Transactional()
  async folderUpload(
    @Req() req,
    @HttpUser('sub') userId: string,
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true }))
    upload: { files: Express.Multer.File[] },
  ) {
    const storage = req.storage;
    const plan = req.plan;
    const used = storage.used;
    const total = toGB(plan.metadata.my_storage) * 1024 * 1024 * 1024; // TODO: Fix this

    const totalSize = upload.files.reduce((acc, f) => acc + f.size, 0);
    if (total - used < totalSize) {
      const msg = `Storage limit exceeded: free ${total - used}, but file size is ${totalSize}`;
      throw new BadRequestException({
        type: 'invalid_request',
        code: 'storage_limit_exceeded',
        message: msg,
      });
    }

    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const cmd = new AddFolderCmd(folderId, userId, upload.files);
    await this.commandBus.execute(cmd);
  }

  private checkFreeSpace(req, files: Express.Multer.File[]) {
    const storage = req.storage;
    const plan = req.plan;
    const used = storage.used;
    const total = toGB(plan.metadata.my_storage) * 1024 * 1024 * 1024; // TODO: Fix this
    const upSize = totalSize(files);

    const isFree = total - used <= upSize;
    return {
      isFree,
      free: total - used,
      total: totalSize,
      upload: totalSize,
    };
  }
}
