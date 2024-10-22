import { ConfigService } from '@nestjs/config';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Module,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { MulterModule as NestMulter } from '@nestjs/platform-express';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Request } from 'express';
import Decimal from 'decimal.js';
import { randomUUID as uuid } from 'crypto';
import * as rx from 'rxjs';
import * as Minio from 'minio';

import { FileRef, FolderContent, FolderInfo } from 'src/domain';
import { StorageEngine } from 'multer';

@Injectable()
export class MiniotorageService implements MulterOptionsFactory {
  private readonly logger = new Logger(MiniotorageService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly minioClient: Minio.Client,
  ) {}

  createMulterOptions(): MulterModuleOptions {
    const storageEngine: StorageEngine = {
      _handleFile: (req, file: Express.Multer.File, cb) => {
        const bucket = this.configService.getOrThrow('MINIO_BUCKET');
        const path = file.path;
        const stream = this.minioClient.putObject(bucket, path, file.stream);
        stream.then(() => cb(null)).catch(cb);
      },
      _removeFile: (req, file, cb) => {
        const bucket = this.configService.getOrThrow('MINIO_BUCKET');
        const path = file.path;
        this.minioClient
          .removeObject(bucket, path, {})
          .then(() => cb(null))
          .catch(cb);
      },
    };

    return {
      fileFilter: (req, file, cb) => {
        cb(null, true);
      },
      storage: storageEngine,
      preservePath: true,
    };
  }
}

@Injectable()
export class FileRollback implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const isHttp = context.getType() === 'http';
    if (!isHttp) return next.handle();
    const request: Request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      rx.catchError((err) => {
        request.emit(ROLLBACK_EVENT, err);
        throw err;
      }),
    );
  }
}

@Module({
  providers: [MiniotorageService],
  exports: [MiniotorageService],
})
class MinotStorage {}

@Module({
  imports: [
    MinotStorage,
    NestMulter.registerAsync({
      imports: [MinotStorage],
    }),
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: FileRollback }],
  exports: [MinotStorage, NestMulter],
})
export class MulterModule {}

type BuiledStructure = {
  folders: Record<string, BuiledStructure>;
  files: Record<string, Express.Multer.File>;
};
export const buildStructure = (raw: Express.Multer.File[]): BuiledStructure => {
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
      id: file.filename,
      name: file.originalname,
      size: file.size,
      contentType: file.mimetype,
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

export const multerToDoamin = (
  files: Express.Multer.File[],
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
