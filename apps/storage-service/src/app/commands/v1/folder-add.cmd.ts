/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import Decimal from 'decimal.js';
import { randomUUID as uuid } from 'crypto';
import { FileRef, Folder, StorageEvent, UUID } from 'src/domain';
import { PrismaClient } from '@prisma/client';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ClientProxy } from '@nestjs/microservices';

export class AddFolderCmd implements ICommand {
  public readonly folderId: string;
  public readonly accssorId: string;
  public readonly flatFiles: Express.Multer.File[];
  constructor(
    folderId: string,
    accssorId: string,
    flatFiles: Express.Multer.File[],
  ) {
    try {
      this.folderId = UUID.parse(folderId);
      this.accssorId = accssorId;
      this.flatFiles = flatFiles;
    } catch (error) {
      if (error instanceof Error) {
        const msg = `${AddFolderCmd.name}: invalid input ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }
}

@CommandHandler(AddFolderCmd)
export class FolderAddHandler implements ICommandHandler<AddFolderCmd> {
  private readonly tx = this.txHost.tx;
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    @Inject('StorageQueue') private readonly storageQueue: ClientProxy,
  ) {}

  @Transactional()
  async execute(cmd: AddFolderCmd) {
    const { folderId, accssorId, flatFiles } = cmd;
    // FIXME: fix 'any' type
    const folder: any = await this.tx.folder.findUnique({
      where: { id: folderId },
    });
    if (!folder) throw new BadRequestException('Folder not found');
    if (folder.archivedAt) throw new BadRequestException('Folder is archived');
    if (folder.ownerId !== accssorId)
      throw new ForbiddenException('User not owner of folder');

    // =================== Express Multer =================== //
    let totalSize = new Decimal(0);
    flatFiles.forEach((file) => {
      totalSize = totalSize.add(new Decimal(file.size));
    });

    const structure = buildStructure(flatFiles);
    const now = new Date();
    const newFolders = buildFolder(structure.folders, folder, accssorId, now);

    // =================== Prisma =================== //
    folder.folders = newFolders;
    const preRgt = folder.rgt;
    reCalculateLftRgt(folder);
    const diff = folder.rgt - preRgt;

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
          size: { increment: totalSize.toNumber() },
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
    const flatedFolders = flatFolder(newFolders);
    const flatedFiles = flatFile(newFolders);

    await this.tx.folder.createMany({
      data: flatedFolders.map(({ folders, files, ...f }) => f),
    });

    await this.tx.fileRef.createMany({
      data: flatedFiles.map(({ folderId, ...f }) => f),
    });

    await this.tx.fileInFolder.createMany({
      data: flatedFiles.map((f) => ({ folderId: f.folderId, fileId: f.id })),
    });

    await Promise.all(tasks);

    const event = new StorageEvent({ type: 'folder_added', data: folder });
    await this.storageQueue.emit(`storage.${rootId}`, event);
  }
}

type BuiledStructure = {
  folders: Record<string, BuiledStructure>;
  files: Record<string, Express.Multer.File>;
};
const buildStructure = (raw: Express.Multer.File[]): BuiledStructure => {
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

const buildFolder = (
  tree: Record<string, BuiledStructure>,
  parent: Folder,
  accssorId: string,
  createdAt: Date,
): Folder[] => {
  return Object.entries(tree).map(([folderName, folder]) => {
    const files: FileRef[] = Object.values(folder.files).map((file) => ({
      id: file.filename,
      name: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      createdAt: createdAt,
      modifiedAt: createdAt,
      ownerId: accssorId,
      archivedAt: null,
      description: null,
      pinnedAt: null,
      thumbnail: null,
    }));
    const folderId = uuid();
    const rootId = parent.rootId ?? parent.id;
    const newFolder: Folder = {
      id: folderId,
      name: folderName,
      ownerId: accssorId,
      createdAt: createdAt,
      modifiedAt: createdAt,
      archivedAt: null,
      pinnedAt: null,
      size: 0,
      rootId: rootId,
      parentId: parent.id,
      depth: 0,
      lft: 0,
      rgt: 0,
      files,
    };
    newFolder.folders = buildFolder(
      folder.folders,
      newFolder,
      accssorId,
      createdAt,
    );
    return newFolder;
  });
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
// ===================================== PARSE PATH ===================================== //

// ===================================================================================== //
