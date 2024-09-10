import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaClient } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as z from 'zod';
import { fileUtil } from 'src/common';
import { FileRef, FolderInfo, UUID } from 'src/domain';

// import { UserService } from '@app/auth0'; // TODO: ???

// =========================== DTOs =========================== //
export const ItemLabel = z.enum(['pinned', 'archived', 'my']).default('my');
const Owner = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  avatarURI: z.string().optional(),
});
export const Pagination = z.object({
  limit: z.number().int().min(10).max(50).default(10),
  fileCursor: UUID.optional(),
  folderCursor: UUID.optional(),
});

export const FolderContentResult = FolderInfo.extend({
  content: z.object({
    files: z.array(FileRef.extend({ owner: Owner.optional() }).optional()),
    folders: z.array(FolderInfo.extend({ owner: Owner.optional() }).optional()),
  }),
  nextCursor: z
    .object({
      fileCursor: z.string().optional(),
      folderCursor: z.string().optional(),
    })
    .optional(),
});

export type ItemLabel = z.infer<typeof ItemLabel>;
export type Pagination = z.infer<typeof Pagination>;
export type FolderContentResult = z.infer<typeof FolderContentResult>;

export class FolderContent implements IQuery {
  constructor(
    public readonly rootId: string,
    public readonly label: ItemLabel,
    public readonly folderId: string,
    public readonly accesserId: string,
    public readonly pagination: Pagination = Pagination.parse({}),
  ) {}
}

// =========================== Query =========================== //
type OwnerDTO = {
  id: string;
  fullName: string;
  email: string | null;
  avatarURI: string | null;
};

@QueryHandler(FolderContent)
export class FolderContentHandler
  implements IQueryHandler<FolderContent, FolderContentResult>
{
  private readonly tx: PrismaClient;
  constructor(
    private readonly txHost: TransactionHost,
    // private readonly userSerivce: any, // TODO: ???
  ) {
    this.tx = this.txHost.tx as PrismaClient; // TODO: not shure this run
  }

  execute(strategyQuery: FolderContent) {
    let strategy:
      | typeof this.getOfMy
      | typeof this.getPinned
      | typeof this.getArchived;

    const label = strategyQuery.label;
    if (label === 'pinned') {
      strategy = this.getPinned;
    } else if (label === 'archived') {
      strategy = this.getArchived;
    } else if (label === 'my') {
      strategy = this.getOfMy;
    } else {
      throw new Error(`Unknown label: ${strategyQuery.label}`);
    }

    return strategy
      .call(
        this,
        strategyQuery.rootId,
        strategyQuery.folderId,
        strategyQuery.pagination,
      )
      .then(async (result) => {
        if (!result) throw new BadRequestException('Folder not found');
        if (result.ownerId !== strategyQuery.accesserId)
          throw new ForbiddenException(`You don't have access to this folder`);
        const { folders, ...parent } = result;

        const userInfos: Record<string, OwnerDTO | null> = {};

        folders.forEach((f) => {
          if (!userInfos[f.ownerId]) userInfos[f.ownerId] = null;
        });

        const files = result.files.map((f) => {
          if (!userInfos[f.file.ownerId]) userInfos[f.file.ownerId] = null;
          return f.file;
        });

        const userIds = Object.keys(userInfos);
        // TODO: implement user service
        // const users = await this.userSerivce
        //   .listUsers(userIds)
        //   .then((users) => {
        //     return {
        //       lists: users.map((u) => ({
        //         id: u.user_id,
        //         fullName: u.name,
        //         email: u.email,
        //         avatarURI: u.picture,
        //       })),
        //     };
        //   });

        const fakedata = [
          {
            id: 'fake',
            fullName: 'fake',
            email: 'fake',
            avatarURI: 'fake',
          },
        ];
        const users = { lists: fakedata };

        users.lists.forEach((u) => {
          userInfos[u.id] = u;
        });

        files.forEach((v, idx, arr) => {
          // arr[idx]['owner'] = userInfos[v.ownerId];
          arr[idx]['owner'] = {
            id: 'fake',
            fullName: 'fake',
            email: 'fake',
            avatarURI: 'fake',
          };
          const isImg = fileUtil.isImg(v.contentType);
          if (isImg) arr[idx]['thumbnail'] = 'TODO: createThumbnailURL';
        });

        folders.forEach((v, idx, arr) => {
          arr[idx]['owner'] = {
            id: 'fake',
            fullName: 'fake',
            email: 'fake',
            avatarURI: 'fake',
          };
        });

        let nextCursor: any = {};
        const limit = strategyQuery.pagination.limit;
        if (files.length > limit) {
          const last = files.pop();
          nextCursor.fileCursor = last.id;
        }
        if (folders.length > limit) {
          const last = folders.pop();
          nextCursor.folderCursor = last.id;
        }
        if (Object.keys(nextCursor).length === 0) nextCursor = undefined;

        parent['nextCursor'] = nextCursor;
        parent['content'] = { files, folders };
        console.log('parent', parent.content.folders);
        return FolderContentResult.parseAsync(parent).catch((err) => {
          Logger.error(err, 'FolderContentResult');
          throw err;
        });
      });
  }

  private getOfMy(_rootId: string, folderId: string, pagination: Pagination) {
    const { limit, folderCursor, fileCursor } = pagination;
    return this.tx.folder.findUnique({
      where: { id: folderId },
      include: {
        folders: {
          ...(folderCursor && { cursor: { id: folderCursor } }),
          take: limit + 1,
          where: { archivedAt: null },
          orderBy: { createdAt: 'asc' },
        },
        files: {
          ...(fileCursor && { cursor: { fileId: fileCursor } }),
          take: limit + 1,
          where: { file: { archivedAt: null } },
          include: { file: true },
          orderBy: { file: { createdAt: 'asc' } },
        },
      },
    });
  }

  private async getPinned(
    rootId: string,
    _folderId: string,
    pagination: Pagination,
  ) {
    const { limit, folderCursor, fileCursor } = pagination;

    return this.tx.folder
      .findUnique({
        where: { id: rootId, lft: 0, rootId: null, parentId: null, depth: 0 },
        include: {
          flatChild: {
            ...(folderCursor && { cursor: { id: folderCursor } }),
            take: limit + 1,
            where: { archivedAt: null },
            include: {
              files: {
                where: { file: { archivedAt: null, pinnedAt: { not: null } } },
                include: { file: true },
              },
            },
          },
          files: {
            ...(fileCursor && { cursor: { fileId: fileCursor } }),
            take: limit + 1,
            where: { file: { archivedAt: null, pinnedAt: { not: null } } },
            include: { file: true },
          },
        },
      })
      .then((result) => {
        if (!result) return null;
        const { flatChild, files, ...parent } = result;
        const _files = files;
        const _folders: any[] = [];
        flatChild.forEach((f) => {
          _folders.push(f);
          _files.push(...f.files);
        });
        return {
          ...parent,
          folders: _folders.filter((f) => f.pinnedAt !== null),
          files: _files,
        };
      });
  }

  private async getArchived(rootId: string) {
    let minDepth = Infinity;
    const root = await this.tx.folder.findUnique({
      where: { id: rootId },
    });
    // TODO: optimize this query
    if (!root) throw new BadRequestException('Root folder not found');

    const archivedFolders = await this.tx.folder
      .findMany({
        where: { rootId: rootId, archivedAt: { not: null } },
        orderBy: { archivedAt: 'asc' },
      })
      .then((folders) => {
        return folders.filter((f) => {
          minDepth = Math.min(minDepth, f.depth);
          return f.depth <= minDepth;
        });
      });

    const archivedFolderIds = archivedFolders.map((f) => f.id);

    const archivedFiles = await this.tx.fileInFolder.findMany({
      where: {
        folderId: { notIn: archivedFolderIds },
        file: { archivedAt: { not: null } },
      },
      include: { file: true },
      orderBy: { file: { archivedAt: 'asc' } },
    });

    return {
      ...root,
      folders: archivedFolders,
      files: archivedFiles,
    };
  }
}
