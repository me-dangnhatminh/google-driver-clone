import { Metadata } from '@grpc/grpc-js';
import { Transactional } from '@nestjs-cls/transactional';
import { Controller, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  GrpcMethod,
  GrpcStreamMethod,
  RpcException,
} from '@nestjs/microservices';

import {
  FileUploadCmd,
  MyFolderContentQuery,
  FolderCreateCmd,
  FolderUpdateCmd,
  HardDeleteItemCmd,
  StorageService,
} from 'src/app';
import { AppError } from 'src/common';
import { FileRef } from 'src/domain';
import * as rx from 'rxjs';
import * as fs from 'fs-extra';
import * as path from 'path';
import { InvalidArgumentRpcException, UnknownRpcException } from 'libs/common';

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
  getFolder(request, metadata: Metadata) {
    const accessorId: string = String(metadata.get('accessorId')[0]);
    if (!accessorId) throw new RpcException('Metadata missing: accessorId');
    const query = new MyFolderContentQuery(
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
        throw new InvalidArgumentRpcException(error.message);
      }
      throw new UnknownRpcException(error.message);
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
        throw new InvalidArgumentRpcException(error.message);
      }
      throw new UnknownRpcException(error.message);
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
        throw new InvalidArgumentRpcException(error.message);
      }
      throw new UnknownRpcException(error.message);
    }
  }

  @GrpcStreamMethod('StorageService', 'uploadFile')
  @Transactional()
  uploadFile(request: rx.Observable<any>, metadata: Metadata) {
    const data = {
      rootId: String(metadata.get('rootId')[0]),
      folderId: String(metadata.get('folderId')[0]),
      fileRef: FileRef.parse(JSON.parse(String(metadata.get('file')[0]))),
      accessorId: String(metadata.get('accessorId')[0]),
    };
    if (!data.accessorId)
      throw new RpcException('Metadata missing: accessorId');
    if (!data.rootId) throw new RpcException('Metadata missing: rootId');
    if (!data.folderId) throw new RpcException('Metadata missing: folderId');
    if (!data.fileRef) throw new RpcException('Metadata missing: fileRef');
    const cmd = new FileUploadCmd(
      data.rootId,
      data.folderId,
      data.accessorId,
      data.fileRef,
    );
    const fileRef = data.fileRef;
    const filePath = path.resolve('.temp', fileRef.id);
    const newFile = fs.createWriteStream(filePath);

    return request.subscribe({
      next: ({ content, offset }) => {
        this.logger.log(`next: ${offset}`);
        newFile.write(content);
      },
      error: (error) => {
        this.logger.error(`error: ${error}`);
        newFile.close();
        fs.unlinkSync(filePath);
        throw new RpcException('Error uploading file');
      },
      complete: async () => {
        newFile.close();
        await this.commandBus.execute(cmd);
        return cmd.item;
      },
    });
  }
}
