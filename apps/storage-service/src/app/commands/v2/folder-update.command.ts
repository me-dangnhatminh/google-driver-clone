import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class UpdateFolderCommand implements ICommand {
  constructor(
    public input: {
      name: string;
      parentId: string;
      createdAt?: Date;
      pinnedAt?: Date;
      modifiedAt?: Date;
      archivedAt?: Date;
      thumbnail?: string;
      description?: string;
      metadata?: Record<string, unknown>;
    },
    public metadata: unknown,
  ) {}
}

@CommandHandler(UpdateFolderCommand)
export class UpdateFolderHandler
  implements ICommandHandler<UpdateFolderCommand>
{
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async execute() {
    // Implementation here
  }
}
