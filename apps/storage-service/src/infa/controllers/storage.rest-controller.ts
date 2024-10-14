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
import {
  FileFieldsInterceptor as FileFields,
  FileInterceptor as FileField,
} from '@nestjs/platform-express';
import { randomUUID as uuid } from 'crypto';
import { Response } from 'express';

import {
  FileUpdateCmd,
  FileUploadCmd,
  FolderAddContentCmd,
  AddFolderCmd,
  UpdateItemDTO,
  ItemHardDelete,
  FolderCreateDTO,
} from 'src/app/commands/v1';

import * as grpc from '@grpc/grpc-js';
import * as fs from 'fs-extra';
import * as rx from 'rxjs';
import * as z from 'zod';

import { Authenticated, HttpUser } from '@app/auth-client';
import { HttpStorage, StorageLoaded } from '@app/storage-client';

import { FileRef, UUID } from 'src/domain';
import { fileUtil, StorageRoutes } from 'src/common';

import { useZodPipe } from '../pipes';
import {
  buildStructure,
  DiskStorageService,
  structureToDoamin,
  totalSize,
} from '../adapters';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  FileContentQuery,
  FolderDownloadQuery,
  ItemLabel,
  Pagination,
} from 'src/app';

const RootOrKey = z.union([z.literal('root'), UUID]);
type RootOrKey = Omit<string, 'root'> | 'root';

@Controller({ version: '1' })
@UseGuards(Authenticated, StorageLoaded)
@ApiTags('storage')
@ApiBearerAuth()
export class StorageRestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly diskStorageService: DiskStorageService,
    @Inject('StorageService') private readonly storageService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  @Get(StorageRoutes.STORAGE_DETAIL)
  myStorage(@Req() req) {
    const storage = req.storage;
    return storage;
  }

  @Get(StorageRoutes.FOLDER_DETAIL)
  getFolder(
    @HttpUser('userId') userId: string,
    @HttpStorage('refId') rootId: string,
    @Query('label', useZodPipe(ItemLabel.default('my'))) label: ItemLabel,
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
  async createFolder(
    @HttpUser('userId') userId: string,
    @HttpStorage('refId') rootId: string,
    @Body(useZodPipe(FolderCreateDTO)) dto: FolderCreateDTO,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
  ) {
    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const meta = new grpc.Metadata();
    meta.add('accessorId', userId);
    const item = { id: uuid(), ownerId: userId, ...dto };
    const fetch = this.storageService.createFolder({ folderId, item }, meta);
    const res = await rx.lastValueFrom(fetch);

    await this.elasticsearchService.index({
      index: 'storage',
      id: item.id,
      body: {
        name: item.name,
        ownerId: item.ownerId,
        folderId: folderId,
      },
    });
    return res;
  }

  // @Patch(StorageRoutes.FOLDER_UPDATE)
  updateFolder(
    @HttpUser('userId') userId: string,
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
    @HttpUser('userId') userId: string,
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

  // search
  @Get('storage/search')
  @ApiQuery({ name: 'q', required: true })
  async search(@Query('q') query: string) {
    const res = await this.elasticsearchService.search({
      index: 'folders',
      body: {
        query: {
          match: {
            name: query,
          },
        },
      },
    });

    return res;
  }

  // ========================== OTHER ========================== //

  // ================================================== //
  // File controller                                    //
  // ================================================== //
  @Post(StorageRoutes.FILE_UPLOAD)
  @UseInterceptors(FileField('file'))
  async fileUpload(
    @Req() req,
    @HttpUser('userId') userId: string,
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ) {
    this.upsertFreeSpace(req, [file]);
    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const cmd = new FileUploadCmd(rootId, folderId, userId, file);
    await this.commandBus.execute(cmd);
  }

  @Post(StorageRoutes.FILE_UPLOADS)
  @UseInterceptors(FileFields([{ name: 'files' }], { preservePath: true }))
  async fileUploads(
    @Req() req,
    @HttpUser('userId') userId: string,
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true }))
    upload: { files: Express.Multer.File[] },
  ) {
    this.upsertFreeSpace(req, upload.files);

    const folderId = UUID.parse(key === 'root' ? rootId : key);
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
  }

  @Get(StorageRoutes.FILE_DOWNLOAD)
  async fileDownload(
    @HttpUser('userId') userId: string,
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
  async fileUpdate(
    @HttpUser('userId') userId: string,
    @Param('key', useZodPipe(UUID)) key: string,
    @Body(useZodPipe(UpdateItemDTO)) dto: UpdateItemDTO,
  ) {
    const fileId: string = key;
    const cmd = new FileUpdateCmd(dto, userId, fileId);
    await this.commandBus.execute(cmd);
  }

  @Get(StorageRoutes.FOLDER_DOWNLOAD)
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
  @UseInterceptors(FileFields([{ name: 'files' }], { preservePath: true }))
  async folderUpload(
    @Req() req,
    @HttpUser('userId') userId: string,
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true }))
    upload: { files: Express.Multer.File[] },
  ) {
    this.upsertFreeSpace(req, upload.files);

    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const cmd = new AddFolderCmd(folderId, userId, upload.files);
    await this.commandBus.execute(cmd);
  }

  private upsertFreeSpace(req, files: Express.Multer.File[]) {
    const upSize = totalSize(files);
    const storage = req.storage;
    const used = storage.used;
    const total = storage.total;
    const isFree = used + upSize <= total;
    if (!isFree) {
      const msg = `Storage limit exceeded: free ${total - used}, but file size is ${upSize}`;
      throw new BadRequestException(msg);
    }

    const free = total - used - upSize;
    return free;
  }

  private checkFreeSpace(req, files: Express.Multer.File[]) {
    const upSize = totalSize(files);

    const storage = req.storage;
    const used = storage.used;
    const total = storage.total;

    const isFree = used + upSize <= total;
    return {
      isFree,
      free: total - used,
      total: totalSize,
      upload: totalSize,
    };
  }
}
