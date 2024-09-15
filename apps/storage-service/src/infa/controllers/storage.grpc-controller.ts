import { Metadata } from '@grpc/grpc-js';
import { Transactional } from '@nestjs-cls/transactional';
import { Controller, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GrpcInvalidArgumentException, GrpcUnknownException } from 'lib/common';

import {
  FolderContentQuery,
  FolderCreateCmd,
  FolderUpdateCmd,
  HardDeleteItemCmd,
  StorageService,
} from 'src/app';
import { AppError } from 'src/common';

@Controller()
export class StorageGrpcController {
  private readonly logger = new Logger(StorageGrpcController.name);
  constructor(
    private readonly storageService: StorageService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod('StorageService', 'myStorage')
  @Transactional()
  myStorage(request, metadata: Metadata) {
    const accessorId: string = String(metadata.get('accessorId')[0]);
    if (!accessorId) throw new RpcException('Metadata missing: accessorId');
    return this.storageService
      .getMyStorage(accessorId)
      .then((storage) => {
        if (!storage) throw new Error('Storage not found');
        else return storage;
      })
      .then((storage) => ({
        name: 'My Storage',
        used: storage.used,
        total: storage.total,
        refId: storage.refId,
      }));
  }

  @GrpcMethod('StorageService', 'getFolder')
  @Transactional()
  getFolder(request, metadata: Metadata) {
    const accessorId: string = String(metadata.get('accessorId')[0]);
    if (!accessorId) throw new RpcException('Metadata missing: accessorId');
    const query = new FolderContentQuery(
      request.rootId,
      request.label,
      request.folderId,
      accessorId,
      request.pagination,
    );
    return this.queryBus.execute(query);
  }

  @GrpcMethod('StorageService', 'createFolder')
  @Transactional()
  createFolder(request, metadata: Metadata) {
    try {
      const accessorId: string = String(metadata.get('accessorId')[0]);
      if (!accessorId) throw new RpcException('Metadata missing: accessorId');
      const cmd = new FolderCreateCmd(
        request.folderId,
        request.item,
        accessorId,
      );
      return this.commandBus.execute(cmd).then(() => cmd.item);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcUnknownException(error.message);
    }
  }

  @GrpcMethod('StorageService', 'updateFolder')
  @Transactional()
  updateFolder(request, metadata: Metadata) {
    try {
      const accessorId: string = String(metadata.get('accessorId')[0]);
      if (!accessorId) throw new RpcException('Metadata missing: accessorId');
      const cmd = new FolderUpdateCmd(
        request.method,
        request.folderId,
        accessorId,
      );
      return this.commandBus.execute(cmd);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcUnknownException(error.message);
    }
  }

  @GrpcMethod('StorageService', 'hardDeleteItem')
  @Transactional()
  async deleteItem(request, metadata: Metadata) {
    try {
      const accessorId: string = String(metadata.get('accessorId')[0]);
      if (!accessorId) throw new RpcException('Metadata missing: accessorId');
      const cmd = new HardDeleteItemCmd(request.rootId, {
        type: request.type,
        id: request.id,
      });
      await this.commandBus.execute(cmd);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcUnknownException(error.message);
    }
  }
}
