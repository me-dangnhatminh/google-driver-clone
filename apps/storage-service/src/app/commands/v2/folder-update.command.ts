import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class UpdateFolderCommand implements ICommand {
  constructor(
    public input: {
      id: string;
      name?: string;
      ownerId?: string;
      // thumbnail?: string;
      // description?: string;
      // metadata?: unknown;
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

  async execute({ input }: UpdateFolderCommand) {
    const folder = await this.tx.folder.findUniqueOrThrow({
      where: { id: input.id },
    });

    const updateData = { ...folder, ...input };
    const isDiff = JSON.stringify(folder) !== JSON.stringify(updateData);
    if (!isDiff) return folder;
    return await this.tx.folder.update({
      where: { id: input.id },
      data: {
        name: input.name,
        ownerId: input.ownerId,
        modifiedAt: new Date(),
      },
    });
  }
}
