import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import Redis from 'ioredis';
import { FolderModel, StorageModel } from 'src/domain';
import { randomUUID as uuid } from 'crypto';
import { OrmFolder, OrmStorage } from 'src/infa/persistence';

export class CreateStorageCommand implements ICommand {
  constructor(
    public input: any,
    public metadata: unknown,
  ) {}
}

@CommandHandler(CreateStorageCommand)
export class CreateStorageHandler
  implements ICommandHandler<CreateStorageCommand>
{
  private readonly tx = this.txHost.tx;
  constructor(
    private txHost: TransactionHost<TransactionalAdapterPrisma>,
    @Inject('IDEMPOTENT_SERVICE') private readonly idempotentService: Redis,
  ) {}

  @Transactional()
  async execute({ input, metadata }: CreateStorageCommand) {
    const now = new Date();
    const id = uuid();
    const rootFolder = new FolderModel({
      id: id,
      createdAt: now.toISOString(),
      modifiedAt: now.toISOString(),
      archivedAt: null,
      name: 'root',
      ownerId: input.ownerId,
      size: 0,
      parentId: null,
      pinnedAt: null,
    });

    const storage = StorageModel.create({
      id: id,
      createdAt: now.toISOString(),
      modifiedAt: now.toISOString(),
      used: 0,
      metadata: {},
      ownerId: input.ownerId,
      refId: rootFolder.props.id,
      archivedAt: null,
      name: 'New Storage',
    });

    // ==
    const storageOrm = OrmStorage.fromDomain(storage).toOrm();
    const { orm: folderOrm } = OrmFolder.fromDomain(rootFolder, {
      rootId: null,
      depth: 0,
      lft: 1,
      rgt: 2,
    });

    await this.tx.folder.create({ data: folderOrm });
    await this.tx.storage.create({
      data: {
        id: storageOrm.id,
        createdAt: storageOrm.createdAt,
        modifiedAt: storageOrm.modifiedAt,
        used: storageOrm.used,
        ownerId: storageOrm.ownerId,
        archivedAt: storageOrm.archivedAt,
        total: storageOrm.total,
        refId: storageOrm.refId,
        metadata: {},
      },
    });

    return await this.handleIdempotency(storage.props, metadata);
  }

  private async handleIdempotency<T>(value: T, metadata: any): Promise<T> {
    const valueStr = JSON.stringify(value);
    const idempotencyKey = metadata['idempotency-key'] ?? null;
    const idempotencyTtl = metadata['idempotency-ttl'] ?? null;
    if (!idempotencyKey || !idempotencyTtl) return JSON.parse(valueStr);
    const key = String(idempotencyKey);
    const ttl = parseInt(idempotencyTtl);
    await this.idempotentService
      .set(key, valueStr, 'PX', ttl, 'NX')
      .then((res) => {
        if (!res) throw new Error('Duplicate request');
      });
    return JSON.parse(valueStr);
  }
}
