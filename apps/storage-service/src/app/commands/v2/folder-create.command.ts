import { randomUUID as uuid } from 'crypto';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import * as rx from 'rxjs';
import { FolderInfo } from 'src/domain';

export type CreateFolderInput = {
  id?: string;
  ownerId: string;
  parentId?: string;
  name?: string;
  createdAt?: Date;
  pinnedAt?: Date;
  modifiedAt?: Date;
  archivedAt?: Date;
  thumbnail?: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

export class CreateFolderCommand implements ICommand {
  constructor(
    public input: CreateFolderInput,
    public metadata: unknown,
  ) {}
}

@Injectable()
export class CreateFolderInterceptor implements NestInterceptor {
  private logger = new Logger(CreateFolderInterceptor.name);
  constructor() {}
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      rx.catchError((error) => {
        if (error.code === 'P2002') throw new Error('Folder already exists');
        if (error.code === 'P2025') throw new Error('Parent folder not found');
        throw error;
      }),
    );
  }
}

@CommandHandler(CreateFolderCommand)
export class CreateFolderHandler
  implements ICommandHandler<CreateFolderCommand>
{
  private readonly tx = this.txHost.tx;
  private DEFAULT_FOLDER_NAME = 'Untitled Folder';

  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  @Transactional()
  @UseInterceptors(CreateFolderInterceptor)
  async execute(command: CreateFolderCommand) {
    const { parentId = null, ...input } = command.input;

    const parent = parentId
      ? await this.tx.folder.findUniqueOrThrow({ where: { id: parentId } })
      : null;

    const rootId = parent ? (parent.rootId ? parent.rootId : parent.id) : null;
    const newFolder = {
      id: input.id || uuid(),
      ownerId: input.ownerId,
      name: input.name || this.DEFAULT_FOLDER_NAME,
      parentId: parent ? parent.id : undefined, // TODO: check if this is correct
      createdAt: input.createdAt || new Date(),
      modifiedAt: input.modifiedAt || new Date(),
      archivedAt: input.archivedAt || null,
      pinnedAt: input.pinnedAt || null,
      // thumbnail: input.thumbnail || null,
      // description: input.description || '',
      // metadata: input.metadata || {},
      rootId: rootId,
      depth: parent ? parent.depth + 1 : 0,
      size: 0n,
      lft: parent ? parent.rgt : 0,
      rgt: parent ? parent.rgt + 1 : 1,
    };
    FolderInfo.parse(newFolder);

    const tasks: Promise<unknown>[] = [];
    tasks.push(this.tx.folder.create({ data: newFolder }));
    if (rootId) {
      tasks.push(
        this.tx.folder.updateMany({
          where: { rootId, rgt: { gte: newFolder.rgt } },
          data: { rgt: { increment: 2 } },
        }),
        this.tx.folder.updateMany({
          where: { rootId, lft: { gt: newFolder.rgt } },
          data: { lft: { increment: 2 } },
        }),
      );
    }
    await Promise.all(tasks);
    return newFolder;
  }
}
