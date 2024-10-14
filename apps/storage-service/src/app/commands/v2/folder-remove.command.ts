import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class RemoveFolderCommand implements ICommand {
  constructor(
    public input: { id: string },
    public metadata: unknown,
  ) {}
}

@CommandHandler(RemoveFolderCommand)
export class RemoveFolderHandler
  implements ICommandHandler<RemoveFolderCommand>
{
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async execute({ input }: RemoveFolderCommand) {
    const { root, parent, ...folder } = await this.tx.folder.findUniqueOrThrow({
      where: { id: input.id },
      select: {
        id: true,
        lft: true,
        rgt: true,
        archivedAt: true,
        parent: { select: { archivedAt: true } },
        root: { select: { id: true } },
      },
    });

    const parentRemoved = parent?.archivedAt !== null;
    if (parentRemoved) {
      throw new Error('Cannot remove a folder with a removed parent');
    }

    const tasks: Promise<unknown>[] = [];

    // toggle archivedAt
    const now = new Date();
    const archivedAt: Date | null = folder.archivedAt ? null : now;
    tasks.push(
      this.tx.folder.update({
        where: { id: folder.id },
        data: { archivedAt, modifiedAt: now },
      }),
      this.tx.folder.updateMany({
        where: {
          rootId: root ? root.id : folder.id,
          lft: { gt: folder.lft },
          rgt: { lt: folder.rgt },
        },
        data: { archivedAt },
      }),
    );

    await Promise.all(tasks);
    return folder;
  }
}
