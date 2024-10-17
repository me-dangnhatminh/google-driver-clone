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
      pinned?: boolean;
      archived?: boolean;
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
    if (input.pinned && input.archived) {
      throw new Error('Cannot `pin` and `archive` a folder at the same time');
    }
    if (input.pinned !== undefined) return await this.pin(input);
    if (input.archived !== undefined) return await this.archive(input);
    return await this.update(input);
  }

  async pin(input: UpdateFolderCommand['input']) {
    const folder = await this.tx.folder.findUniqueOrThrow({
      where: { id: input.id },
    });
    const isPinned = Boolean(!!folder.pinnedAt);
    if (String(isPinned) === String(input.pinned)) return folder;
    const now = new Date();
    const data = { pinnedAt: isPinned ? null : now, modifiedAt: now };
    return await this.tx.folder.update({ where: { id: input.id }, data });
  }

  async archive(input: UpdateFolderCommand['input']) {
    const folder = await this.tx.folder.findUniqueOrThrow({
      where: { id: input.id },
    });
    const isArchived = Boolean(!!folder.archivedAt);
    if (String(isArchived) === String(input.archived)) return folder;
    const rootId = folder.rootId || folder.id;
    const now = new Date();
    const data = { archivedAt: isArchived ? null : now, modifiedAt: now };
    return await this.tx.folder.updateMany({
      where: {
        rootId,
        lft: { gte: folder.lft },
        rgt: { lte: folder.rgt },
      },
      data,
    });
  }

  async update(input: UpdateFolderCommand['input']) {
    const folder = await this.tx.folder.findUniqueOrThrow({
      where: { id: input.id },
    });
    if (folder.name === input.name) return folder;
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
