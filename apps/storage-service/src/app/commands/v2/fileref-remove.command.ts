import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class RemoveFileRefCommand implements ICommand {
  constructor(
    public input: unknown,
    public metadata: unknown,
  ) {}
}

@CommandHandler(RemoveFileRefCommand)
export class RemoveFileRefHandler
  implements ICommandHandler<RemoveFileRefCommand>
{
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async execute({ input }: RemoveFileRefCommand) {
    return input;
  }
}
