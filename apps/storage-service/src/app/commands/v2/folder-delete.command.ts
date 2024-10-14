import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class DeleteFolderCommand implements ICommand {
  constructor(
    public input: { id: string },
    public metadata: unknown,
  ) {}
}

@CommandHandler(DeleteFolderCommand)
export class DeleteFolderHandler
  implements ICommandHandler<DeleteFolderCommand>
{
  private readonly tx = this.txHost.tx;
  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async execute({ input }: DeleteFolderCommand) {
    const { root, ...folder } = await this.tx.folder.findUniqueOrThrow({
      where: { id: input.id },
      include: { root: true },
    });

    const tasks: Promise<unknown>[] = [];

    tasks.push(this.tx.folder.delete({ where: { id: folder.id } })); // [cascade delete] folder
    tasks.push(
      this.tx.fileRef.deleteMany({
        where: { folder: { folderId: folder.id } },
      }),
    );

    if (root) {
      const diff = folder.rgt - folder.lft + 1;
      tasks.push(
        this.tx.folder.updateMany({
          where: { rootId: root.id, rgt: { gt: folder.rgt } },
          data: { rgt: { decrement: diff } },
        }),
        this.tx.folder.updateMany({
          where: { rootId: root.id, lft: { gt: folder.rgt } },
          data: { lft: { decrement: diff } },
        }),
      );
    }

    await Promise.all(tasks);
    return folder;
  }
}
