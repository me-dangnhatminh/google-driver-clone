import z from 'zod';
import { FileRef, Folder, FolderContent, StorageEvent } from 'src/domain';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import Decimal from 'decimal.js';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export const FolderAddContentInput = z.object({
  accessorId: z.string(),
  folderId: z.string(),
  content: z.object({
    files: z.array(FileRef),
    folders: z.array(FolderContent),
  }),
});

export type FolderAddContentInput = z.infer<typeof FolderAddContentInput>;

export class FolderAddContentCmd implements ICommand {
  public readonly accessorId: string;
  public readonly folderId: string;
  public readonly content: {
    files: FileRef[];
    folders: FolderContent[];
  };
  constructor(input: FolderAddContentInput) {
    const valid = FolderAddContentInput.parse(input);
    this.accessorId = valid.accessorId;
    this.folderId = valid.folderId;
    this.content = valid.content;
  }
}

@CommandHandler(FolderAddContentCmd)
export class FolderAddContentHandler
  implements ICommandHandler<FolderAddContentCmd, void>
{
  private readonly tx = this.txHost.tx;
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    @Inject('StorageQueue') private readonly storageQueue: ClientProxy,
  ) {}

  @Transactional()
  async execute(cmd: FolderAddContentCmd) {
    const { files, folders } = cmd.content;
    const folder: Folder = await this.tx.folder
      .findUniqueOrThrow({
        where: { id: cmd.folderId },
      })
      .then((f) => ({ ...f, size: Number(f.size), folders, files }));

    const preRgt = folder.rgt;
    reCalculateLftRgt(folder);
    const diff = folder.rgt - preRgt;
    const totalSize = calculateSizeContent(folder);

    // =================== Prisma =================== //

    const tasks: Promise<any>[] = [];

    // extend root
    const rootId = folder.rootId ?? folder.id;
    tasks.push(
      this.tx.folder.update({
        where: {
          id: rootId,
          rootId: null,
          parentId: null,
          lft: 0,
          depth: 0,
        },
        data: {
          rgt: { increment: diff },
          size: { increment: totalSize },
        },
      }),
    );

    // extend right siblings
    const isRoot = folder.rootId === folder.id;
    if (!isRoot)
      tasks.push(
        this.tx.folder.updateMany({
          where: { rootId, rgt: { gte: preRgt } },
          data: { rgt: { increment: diff } },
        }),
        this.tx.folder.updateMany({
          where: { rootId, lft: { gt: preRgt } },
          data: { lft: { increment: diff } },
        }),
      );

    // -- persist news
    const flatedFolders = flatFolder(folder.folders);
    const flatedFiles = flatFile(folder.folders);
    flatedFiles.push(...files.map((f) => ({ ...f, folderId: folder.id })));

    await this.tx.folder.createMany({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      data: flatedFolders.map(({ folders, files, ...f }) => f),
    });

    await this.tx.fileRef.createMany({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      data: flatedFiles.map(({ folderId, ...f }) => f),
    });

    await this.tx.fileInFolder.createMany({
      data: flatedFiles.map((f) => ({ folderId: f.folderId, fileId: f.id })),
    });

    await Promise.all(tasks);

    // =================== Event =================== //
    const event = new StorageEvent({ type: 'folder_added', data: folder });
    await this.storageQueue.emit(`storage.${rootId}`, event);
  }
}

/**
 * This is mutated function,
 * will calculate child from parent
 * vars left, right, depth of parent must be set
 */
const reCalculateLftRgt = (parent: Folder): number => {
  const children = parent.folders ?? [];
  if (children.length === 0) return parent.rgt;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    child.depth = parent.depth + 1;
    child.parentId = parent.id;
    child.rootId = parent.rootId ?? parent.id;
    child.lft = parent.rgt;
    child.rgt = parent.rgt + 1;
    child.rgt = reCalculateLftRgt(child);
    parent.rgt = child.rgt + 1;
  }
  return parent.rgt;
};

const flatFolder = (folder: Folder[]): Folder[] => {
  return folder.flatMap((f) => [f, ...flatFolder(f.folders ?? [])]);
};

const flatFile = (folder: Folder[]): (FileRef & { folderId: string })[] => {
  return folder.reduce<(FileRef & { folderId: string })[]>((acc, f) => {
    if (f.files)
      acc.push(...f.files.map((file) => ({ ...file, folderId: f.id })));
    if (f.folders) acc.push(...flatFile(f.folders));
    return acc;
  }, []);
};

export const calculateSizeContent = (folder: Folder): number => {
  const files = folder.files ?? [];
  const folders = folder.folders ?? [];
  const filesSize = files.reduce((acc, f) => acc.add(f.size), new Decimal(0));
  const foldersSize = folders.reduce(
    (acc, f) => acc.add(calculateSizeContent(f)),
    new Decimal(0),
  );
  return filesSize.add(foldersSize).toNumber();
};
