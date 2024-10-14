import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class CreateFileRefCommand implements ICommand {
  constructor(
    public input: unknown,
    public metadata: unknown,
  ) {}
}

@CommandHandler(CreateFileRefCommand)
export class CreateFileRefHandler
  implements ICommandHandler<CreateFileRefCommand>
{
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async execute({ input }: CreateFileRefCommand) {
    return input;
  }
}
