import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import Redis from 'ioredis';
import { RootFolder, Storage } from 'src/domain';
import { randomUUID as uuid } from 'crypto';

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
    const root = RootFolder.parse({
      id: id,
      ownerId: input.ownerId,
      name: 'My Storage',
      createdAt: now,
      modifiedAt: now,
    });
    const result = await this.tx.storage
      .create({
        data: {
          ...input,
          id: id,
          createdAt: now,
          modifiedAt: now,
          metadata: input.metadata || {},
          ref: { create: root },
        },
      })
      .then((s) => Storage.parse(s));
    return await this.handleIdempotency(result, metadata);
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
