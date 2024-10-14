import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class DeleteFileRefCommand implements ICommand {
  constructor(
    public input: unknown,
    public metadata: unknown,
  ) {}
}

@CommandHandler(DeleteFileRefCommand)
export class DeleteFileRefHandler
  implements ICommandHandler<DeleteFileRefCommand>
{
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async execute({ input }: DeleteFileRefCommand) {
    return input;
  }
}
