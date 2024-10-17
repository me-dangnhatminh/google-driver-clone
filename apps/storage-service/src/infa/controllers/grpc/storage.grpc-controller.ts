import { Metadata } from '@grpc/grpc-js';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { randomUUID as uuid } from 'crypto';
import Redis from 'ioredis';
import { RootFolder } from 'src/domain';
import { IdempotencyInterceptor } from 'src/infa/adapters';

@Controller()
export class StorageGrpcController {
  private readonly tx = this.txHost.tx;
  constructor(
    @Inject('IDEMPOTENT_SERVICE')
    private readonly idempotentService: Redis,
    private txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  @GrpcMethod('StorageService', 'get')
  async get(request) {
    return await this.tx.storage.findFirstOrThrow({
      where: { id: request.id },
    });
  }

  @Transactional()
  @UseInterceptors(IdempotencyInterceptor)
  @GrpcMethod('StorageService', 'create')
  async create(request, metadata: Metadata) {
    const now = new Date();
    const id = uuid();
    const root = RootFolder.parse({
      id: id,
      ownerId: request.ownerId,
      name: 'My Storage',
      createdAt: now,
      modifiedAt: now,
    });
    const result = await this.tx.storage.create({
      data: {
        ...request,
        id: id,
        createdAt: now,
        modifiedAt: now,
        metadata: request.metadata || {},
        ref: { create: root },
      },
    });

    return await this.handleIdempotency(result, metadata);
  }

  private async handleIdempotency<T>(value: T, metadata: Metadata): Promise<T> {
    //TODO: move to interceptor (error)
    const idempotencyKey = metadata.get('idempotency-key')[0] ?? null;
    const idempotencyTtl = metadata.get('idempotency-ttl')[0] ?? null;
    if (!idempotencyKey) return value;
    const ok = await this.idempotentService.set(
      String(idempotencyKey),
      JSON.stringify(value),
      'PX',
      Number(idempotencyTtl ?? 24 * 60 * 60 * 1000),
      'NX',
    );
    if (ok !== 'OK') {
      throw new RpcException(`Duplicate request with key: ${idempotencyKey}`);
    }
    return value;
  }
}
