import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import z from 'zod';

export const UpdateStorageInput = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  limit: z.number().min(-1).optional(), // -1 means unlimited
  metadata: z.record(z.any()).optional(),
});

export type UpdateStorageInput = z.infer<typeof UpdateStorageInput>;
export class StorageUpdateCmd implements ICommand {
  constructor(public readonly input: UpdateStorageInput) {
    this.input = UpdateStorageInput.parse(input);
  }
}

@CommandHandler(StorageUpdateCmd)
export class StorageUpdateHandler implements ICommandHandler<StorageUpdateCmd> {
  private readonly logger = new Logger(StorageUpdateHandler.name);
  private readonly tx: TransactionHost<TransactionalAdapterPrisma>['tx'];
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    this.tx = txHost.tx;
  }

  async execute() {
    // await this.tx.myStorage.update({
    //   where: { id: cmd.input.id },
    //   data: cmd.input,
    // });
    // this.logger.debug(`Storage updated: ${cmd.input.id}`);
  }
}
