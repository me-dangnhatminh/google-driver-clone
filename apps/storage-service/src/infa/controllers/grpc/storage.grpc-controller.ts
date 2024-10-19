import { Metadata } from '@grpc/grpc-js';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateStorageCommand } from 'src/app/commands/v2';
import {
  grpcMetadataToObj,
  IdempotencyInterceptor,
  IdempotencyTTL,
} from 'src/infa/adapters';
import { Storage } from 'src/domain';

@Controller()
export class StorageGrpcController {
  private readonly tx = this.txHost.tx;
  constructor(
    @Inject('IDEMPOTENT_SERVICE')
    private readonly commandBus: CommandBus,
    private txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  @GrpcMethod('StorageService', 'get')
  async get(request) {
    return await this.tx.storage
      .findFirstOrThrow({ where: { id: request.id } })
      .then((res) => Storage.parse(res));
  }

  @GrpcMethod('StorageService', 'create')
  @UseInterceptors(IdempotencyInterceptor)
  @IdempotencyTTL(24 * 60 * 60 * 1000)
  async create(request, metadata: Metadata) {
    const metaObj = grpcMetadataToObj(metadata);
    const command = new CreateStorageCommand(request, metaObj);
    const result = await this.commandBus.execute(command);
    return result;
  }
}
