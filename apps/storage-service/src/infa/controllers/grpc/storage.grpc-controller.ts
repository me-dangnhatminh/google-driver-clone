import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { randomUUID as uuid } from 'crypto';

@Controller()
export class StorageGrpcController {
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  @GrpcMethod('StorageService', 'get')
  async get(request) {
    return await this.tx.myStorage.findFirstOrThrow({
      where: { id: request.id },
    });
  }

  @Transactional()
  @GrpcMethod('StorageService', 'create')
  async create(request) {
    request['id'] = uuid();
    return await this.tx.myStorage.create({ data: request });
  }
}
