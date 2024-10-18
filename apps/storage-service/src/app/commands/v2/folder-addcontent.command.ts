import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import Decimal from 'decimal.js';
import { FileRef, Folder, FolderContent, FolderInfo } from 'src/domain';
import { randomUUID as uuid } from 'crypto';

export class AddContentFolderCommand implements ICommand {
  constructor(
    public readonly input: {
      id: string;
      content: { flatten: (FileRef & { originalname: string })[] };
    },
    public readonly metadata?: any,
  ) {}
}

@CommandHandler(AddContentFolderCommand)
export class AddContentFolderCommandHandler
  implements ICommandHandler<AddContentFolderCommand>
{
  private readonly tx = this.txHost.tx;
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    @Inject('StorageQueue') private readonly storageQueue: ClientProxy,
  ) {}

  @Transactional()
  async execute({ input }: AddContentFolderCommand) {
    const folder = await this.tx.folder
      .findUniqueOrThrow({ where: { id: input.id } })
      .then((f) => Folder.parse(f));

    const tree = buildStructure(input.content.flatten);
    const content = structureToDoamin(tree, folder, folder.ownerId);
    const { files, folders } = content;
    folder.files = FileRef.array().parse(files);
    folder.folders = FolderContent.array().parse(folders);

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
        where: { id: rootId },
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
    return folder;
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

type BuiledStructure = {
  folders: Record<string, BuiledStructure>;
  files: Record<string, FileRef & { originalname: string }>;
};
export const buildStructure = (
  raw: (FileRef & { originalname: string })[],
): BuiledStructure => {
  const files = structuredClone(raw);
  const structure: BuiledStructure = { folders: {}, files: {} };
  for (const file of files) {
    const path = file.originalname.split('/');
    if (path.length < 2) {
      structure.files[file.originalname] = file;
      continue;
    }
    let current = structure.folders;
    for (let i = 0; i < path.length - 1; i++) {
      const folder = path[i];
      current[folder] = current[folder] ?? { folders: {}, files: {} };
      if (i === path.length - 2) break;
      current = current[folder].folders;
    }
    const lastFolder = path[path.length - 2];
    const fileName = path[path.length - 1];
    file.originalname = fileName;
    current[lastFolder].files[fileName] = file;
  }
  return structure;
};

export const structureToDoamin = (
  tree: BuiledStructure,
  parent: FolderInfo,
  ownerId?: string,
  createdAt: Date = new Date(),
): {
  files: FileRef[];
  folders: FolderContent[];
} => {
  const files = Object.values(tree.files).map((file) => {
    return {
      id: file.id,
      name: file.originalname,
      size: file.size,
      contentType: file.contentType,
      ownerId: ownerId ?? parent.ownerId,
      createdAt: createdAt.toISOString(),
      modifiedAt: createdAt.toISOString(),
      archivedAt: null,
      pinnedAt: null,
      description: null,
      thumbnail: null,
    } satisfies FileRef;
  });

  const folders = Object.entries(tree.folders).map(([folderName, folder]) => {
    const info = {
      id: uuid(),
      name: folderName,
      ownerId: ownerId ?? parent.ownerId,
      parentId: parent.id,
      createdAt: createdAt.toISOString(),
      modifiedAt: createdAt.toISOString(),
      archivedAt: null,
      pinnedAt: null,
      size: 0,
      files: [],
    } satisfies FolderContent;

    const { files, folders } = structureToDoamin(
      folder,
      info,
      ownerId,
      createdAt,
    );
    return Object.assign(info, { files, folders }) as FolderContent;
  });

  return { files, folders };
};

export const flattenToDoamin = (
  files: (FileRef & { originalname: string })[],
  parent: FolderInfo,
  ownerId?: string,
  createdAt?: Date,
) => {
  const structure = buildStructure(files);
  return structureToDoamin(structure, parent, ownerId, createdAt);
};

export const totalSize = (files: Express.Multer.File[]) => {
  return files
    .reduce((acc, file) => {
      return acc.add(new Decimal(file.size.toString()));
    }, new Decimal(0))
    .toNumber();
};
