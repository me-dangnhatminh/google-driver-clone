import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { randomUUID as uuid } from 'crypto';

import * as grpc from '@grpc/grpc-js';
import * as rx from 'rxjs';
import * as z from 'zod';

import { UUID } from 'src/domain';
import {
  ItemLabel,
  UpdateItemDTO,
  ItemHardDelete,
  FolderCreateDTO,
  Pagination,
} from 'src/app';

import { Authenticated, HttpUser } from 'libs/auth-client';
import {
  STORAGE_SERVICE_NAME,
  HttpStorage,
  StorageLoaded,
} from 'libs/storage-client';

import { useZodPipe } from '../pipes';

const RootOrKey = z.union([z.literal('root'), UUID]);
type RootOrKey = Omit<string, 'root'> | 'root';

@Controller({ path: 'storage', version: '2' })
@ApiTags('storage-v2')
@UseGuards(Authenticated, StorageLoaded)
@ApiBearerAuth()
export class StorageRestControllerV2 {
  private readonly storageService: any;

  constructor(@Inject(STORAGE_SERVICE_NAME) client: ClientGrpcProxy) {
    this.storageService = client.getService('StorageService');
  }

  @Get('storage')
  myStorage(@HttpStorage() storage: any) {
    return {
      name: 'My Storage',
      used: storage.used,
      total: storage.total,
    };
  }

  @Get('storage/:key')
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
    const input = { rootId, label, folderId, pagination };
    const get = this.storageService.getFolder(input, meta);
    return rx.lastValueFrom(get);
  }

  @Put('storage/:key')
  createFolder(
    @HttpUser('id') userId: string,
    @HttpStorage('refId') rootId: string,
    @Body(useZodPipe(FolderCreateDTO)) dto: FolderCreateDTO,
    @Param('key', useZodPipe(RootOrKey)) key: RootOrKey,
  ) {
    const folderId = UUID.parse(key === 'root' ? rootId : key);
    const meta = new grpc.Metadata();
    meta.add('accessorId', userId);
    const input = { folderId, item: { id: uuid(), ownerId: userId, ...dto } };
    const fetch = this.storageService.createFolder(input, meta);
    return rx.lastValueFrom(fetch);
  }

  @Patch('storage/:key')
  updateFolder(
    @HttpUser('id') userId: string,
    @Body(useZodPipe(UpdateItemDTO)) dto: UpdateItemDTO,
    @Param('key', useZodPipe(UUID)) folderId: string,
  ) {
    const meta = new grpc.Metadata();
    meta.add('accessorId', userId);
    const input = { folderId, method: dto };
    const fetch = this.storageService.updateFolder(input, meta);
    return rx.lastValueFrom(fetch);
  }

  @Delete('storage/items/:key')
  deleteItem(
    @HttpUser('id') userId: string,
    @HttpStorage('refId') rootId: string,
    @Param('key', useZodPipe(UUID)) key: string,
    @Query('type', useZodPipe(ItemHardDelete.shape.type))
    type: ItemHardDelete['type'],
  ) {
    const meta = new grpc.Metadata();
    meta.add('accessorId', userId);
    const input = { rootId, id: key, type };
    const fetch = this.storageService.hardDeleteItem(input, meta);
    return rx.lastValueFrom(fetch);
  }

  @Delete('storage/items')
  deleteItems(
    @HttpUser('id') userId: string,
    @HttpStorage('refId') rootId: string,
    @Query('ids', useZodPipe(z.array(UUID))) ids: string[],
    @Query('type', useZodPipe(ItemHardDelete.shape.type))
    type: ItemHardDelete['type'],
  ) {
    const meta = new grpc.Metadata();
    meta.add('accessorId', userId);
    const input = { rootId, ids, type };
    const fetch = this.storageService.hardDeleteItems(input, meta);
    return rx.lastValueFrom(fetch);
  }
}
