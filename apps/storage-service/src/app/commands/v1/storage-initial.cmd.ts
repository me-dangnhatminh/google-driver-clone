import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { MyStorage, RootFolder } from 'src/domain';
import { randomUUID as uuid } from 'crypto';
import z from 'zod';

export const InitialStorageInput = MyStorage.omit({ refId: true });
export type InitialStorageInput = z.infer<typeof InitialStorageInput>;

export class StorageInitialCmd implements ICommand {
  public readonly input: InitialStorageInput;
  constructor(input: Partial<InitialStorageInput>) {
    this.input = InitialStorageInput.parse(
      Object.assign({ id: uuid() }, input),
    );
  }
}

@CommandHandler(StorageInitialCmd)
export class StorageInitialHandler
  implements ICommandHandler<StorageInitialCmd>
{
  private readonly logger = new Logger(StorageInitialHandler.name);
  private readonly tx: TransactionHost<TransactionalAdapterPrisma>['tx'];
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    this.tx = txHost.tx;
  }

  async execute({ input }: StorageInitialCmd) {
    const storage = input;
    const root = RootFolder.parse({
      id: input.id,
      ownerId: input.ownerId,
      name: 'My Storage',
    });

    await this.tx.myStorage.create({
      data: { ...storage, ref: { create: root } },
    });
  }
}
