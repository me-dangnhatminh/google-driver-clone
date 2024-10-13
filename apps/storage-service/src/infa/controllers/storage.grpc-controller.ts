import { Metadata } from '@grpc/grpc-js';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Controller, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  GrpcMethod,
  GrpcStreamMethod,
  RpcException,
} from '@nestjs/microservices';

import {
  FileUploadCmd,
  FolderCreateCmd,
  FolderUpdateCmd,
  HardDeleteItemCmd,
  StorageInitialCmd,
} from 'src/app/commands';
import { MyFolderContentQuery, GetStorageQuery } from 'src/app/queries';

import { AppError } from 'src/common';
import { FileRef, MyStorage } from 'src/domain';
import * as rx from 'rxjs';
import * as fs from 'fs-extra';
import * as path from 'path';
import { InvalidArgumentRpcException, UnknownRpcException } from '@app/common';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Controller()
export class StorageGrpcController {
  private readonly logger = new Logger(StorageGrpcController.name);
  private readonly tx = this.txHost.tx;
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  @GrpcMethod('StorageService', 'get')
  async get(request) {
    let query: GetStorageQuery;
    try {
      query = new GetStorageQuery(request);
    } catch (error: any) {
      console.error(error);
      throw new UnknownRpcException(error.message);
    }
    return await this.queryBus.execute(query);
  }

  @GrpcMethod('StorageService', 'initial')
  async initial(request) {
    request['ownerId'] = request['owner_id'];
    const cmd = new StorageInitialCmd(request);
    await this.commandBus.execute(cmd);
    return cmd.input;
  }

  @GrpcMethod('StorageService', 'update')
  async update(
    request: Partial<{
      name: string;
      description: string;
      metadata: Record<string, any>;
      total: number;
    }> & { id: string },
  ) {
    return this.tx.myStorage.update({
      where: { id: request.id },
      data: { metadata: request.metadata, total: request.total },
    });
  }

  @GrpcMethod('StorageService', 'myStorage')
  myStorage(request, metadata: Metadata) {
    const accessorId: string = String(metadata.get('accessorId')[0]);
    if (!accessorId) throw new RpcException('Metadata missing: accessorId');
    const ownerId = accessorId;
    return this.tx.myStorage
      .findUniqueOrThrow({ where: { ownerId }, include: { ref: true } })
      .then((m) => {
        m['name'] = m.ref.name;
        m['used'] = m.ref.size;
        return m;
      })
      .then((m) => MyStorage.parse(m));
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

  @GrpcMethod('StorageService', 'getFolderInfo')
  getFolderInfo(request, metadata: Metadata) {
    const accessorId: string = String(metadata.get('accessorId')[0]);
    if (!accessorId) throw new RpcException('Metadata missing: accessorId');
    return this.tx.folder.findUnique({ where: { id: request.folderId } });
  }
}
