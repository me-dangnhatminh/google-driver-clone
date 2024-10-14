import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class UpdateFileRefCommand implements ICommand {
  constructor(
    public input: unknown,
    public metadata: unknown,
  ) {}
}

@CommandHandler(UpdateFileRefCommand)
export class UpdateFileRefHandler
  implements ICommandHandler<UpdateFileRefCommand>
{
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async execute({ input }: UpdateFileRefCommand) {
    return input;
  }
}
