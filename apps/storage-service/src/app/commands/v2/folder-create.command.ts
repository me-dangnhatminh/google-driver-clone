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
import { CreateFolderProps, FolderModel } from 'src/domain';
import { OrmFolder } from 'src/infa/persistence';

export class CreateFolderCommand implements ICommand {
  constructor(
    public input: CreateFolderProps,
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

  constructor(private txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  @Transactional()
  @UseInterceptors(CreateFolderInterceptor)
  async execute(command: CreateFolderCommand) {
    const folderDomain = FolderModel.create(command.input);
    const folder = folderDomain.props;

    const parentId = folder.parentId;
    const parent = parentId
      ? await this.tx.folder.findUniqueOrThrow({ where: { id: parentId } })
      : null;
    const rootId = parent ? (parent.rootId ? parent.rootId : parent.id) : null;

    // ===== Create new folder ===== //
    const { orm: newFolder } = OrmFolder.fromDomain(folderDomain, {
      rootId,
      depth: parent ? parent.depth + 1 : 0,
      lft: parent ? parent.rgt : 0,
      rgt: parent ? parent.rgt + 1 : 1,
    });

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
