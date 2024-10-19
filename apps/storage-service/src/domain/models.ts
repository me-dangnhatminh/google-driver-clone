import * as z from 'zod';
import { randomUUID as uuid } from 'crypto';

export type UUID = z.infer<typeof UUID>;
export type Bytes = z.infer<typeof Bytes>;
export type PastTime = z.infer<typeof PastTime>;
export type FileRef = z.infer<typeof FileRef>;
export type Folder = z.infer<typeof Folder>;
export type FolderInfo = z.infer<typeof FolderInfo>;
export type FolderContent = z.infer<typeof FolderContent>;
export type RootFolder = z.infer<typeof RootFolder>;
export type Storage = z.infer<typeof Storage>;

// ============================= Schemas ============================= //
export const UUID = z.string().uuid();
export const OnwerId = z.string();
export const Bytes = z.coerce.number().min(0);
export const PastTime = z.coerce
  .date()
  .refine((d) => d.getTime() <= Date.now())
  .transform((d) => d.toISOString());

export const FileRef = z.object({
  id: UUID,
  name: z.string(),
  size: Bytes,
  createdAt: PastTime.default(() => new Date()),
  modifiedAt: PastTime.default(() => new Date()),
  pinnedAt: PastTime.nullable().default(null),
  archivedAt: PastTime.nullable().default(null),
  ownerId: OnwerId,
  contentType: z.string(),
  thumbnail: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
});

export const FolderInfo = z.object({
  id: UUID,
  name: z.string(),
  size: Bytes.default(0),
  ownerId: OnwerId,
  createdAt: PastTime.default(() => new Date()),
  modifiedAt: PastTime.default(() => new Date()),
  parentId: UUID.nullable().default(null),
  pinnedAt: PastTime.nullable().default(null),
  archivedAt: PastTime.nullable().default(null),
});

export const FolderContent = FolderInfo.extend({
  files: z.lazy(() => z.array(FileRef)).optional(),
  folders: z.lazy(() => z.array(FolderContent)).optional(),
});

export const Folder = FolderInfo.extend({
  rootId: UUID.nullable().default(null),
  parentId: UUID.nullable().default(null),
  depth: z.number().int().min(0).default(0),
  lft: z.number().int().min(0).default(0),
  rgt: z.number().int().min(1).default(1),
  files: z.lazy(() => z.array(FileRef)).optional(),
  folders: z.lazy(() => z.array(Folder)).optional(),
});

export const RootFolder = Folder.omit({ files: true, folders: true }).extend({
  depth: z.literal(0).default(0),
  lft: z.literal(0).default(0),
  rootId: z.literal(null).default(null),
  parentId: z.literal(null).default(null),
  pinnedAt: z.literal(null).default(null),
});

export const Storage = z.object({
  id: UUID.default(uuid),
  ownerId: OnwerId,
  name: z.string().optional(),
  refId: UUID,
  used: Bytes.default(0),
  metadata: z.record(z.any()).default({}),
  createdAt: PastTime.default(() => new Date()),
  modifiedAt: PastTime.default(() => new Date()),
  archivedAt: PastTime.nullable().default(null),
});

// ========= Access control ========= //
export const PermissionType = z.enum(['public', 'private']);
export const Permission = z.enum(['read', 'write', '*']);

export const FolderPermission = FolderInfo.extend({
  type: PermissionType.default('private'),
  permission: Permission.default('*'),
});

export const FilePermission = FileRef.extend({
  type: PermissionType.default('private'),
  permission: Permission.default('*'),
});

// =================================== MODEL =================================== //
export class FileModel {
  protected static DEFAULT_NAME = 'New File';

  protected _props: FileRef;
  constructor(props: FileRef | FileModel) {
    let valid: FileRef;
    if (props instanceof FileModel) {
      valid = FileModel.schema.parse(props.props);
    } else {
      valid = FileModel.schema.parse(props);
    }
    this._props = valid;
  }

  get props() {
    return structuredClone(this._props);
  }

  update(props: z.infer<typeof FileModel.UpdateSchema>) {
    const valid = FileModel.schema.parse({
      ...this._props,
      ...props,
    });
    this._props = valid;
    return this;
  }

  delete() {
    this._props.archivedAt = new Date().toISOString();
    return this;
  }

  // ============================= Static methods ============================= //
  static readonly schema = FileRef;
  static readonly CreateSchema = FileModel.schema.partial().required({
    size: true,
    ownerId: true,
    contentType: true,
  });

  static readonly UpdateSchema = FileModel.schema.omit({
    id: true,
    createdAt: true,
    pinnedAt: true,
    archivedAt: true,
  });

  static create(props: z.infer<typeof FileModel.CreateSchema>) {
    return new FileModel({
      id: uuid(),
      name: props.name || FileModel.DEFAULT_NAME,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      archivedAt: null,
      description: null,
      thumbnail: null,
      pinnedAt: null,
      ...props,
    });
  }
}

export class FolderModel {
  protected static DEFAULT_NAME = 'New Folder';

  protected _props: FolderInfo;
  constructor(props: FolderInfo | FolderModel) {
    let valid: FolderInfo;
    if (props instanceof FolderModel) {
      valid = FolderModel.schema.parse(props.props);
    } else {
      valid = FolderModel.schema.parse(props);
    }
    this._props = valid;
  }

  static new(props: FolderInfo | FolderModel) {
    return new FolderModel(props);
  }

  get props() {
    return structuredClone(this._props);
  }

  update(props: z.infer<typeof FolderModel.UpdateSchema>) {
    const valid = FolderModel.schema.parse({
      ...this._props,
      ...props,
    });
    this._props = valid;
    return this;
  }

  delete() {
    this._props.archivedAt = new Date().toISOString();
    return this;
  }

  // ============================= Static methods ============================= //
  static readonly schema = FolderInfo;
  static readonly CreateSchema = FolderModel.schema.partial().required({
    ownerId: true,
  });

  static readonly UpdateSchema = FolderModel.schema
    .omit({
      id: true,
      createdAt: true,
      modifiedAt: true,
      pinnedAt: true,
      archivedAt: true,
    })
    .extend({
      pinned: z.boolean().optional(),
      archived: z.boolean().optional(),
    })
    .partial();

  static create(props: z.infer<typeof FolderModel.CreateSchema>) {
    return new FolderModel({
      id: uuid(),
      name: FolderModel.DEFAULT_NAME,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      archivedAt: null,
      parentId: null,
      pinnedAt: null,
      size: 0,
      ...props,
    });
  }
}

export type CreateFolderProps = z.infer<typeof FolderModel.CreateSchema>;
export type UpdateFolderProps = z.infer<typeof FolderModel.UpdateSchema>;

export class StorageModel {
  protected _props: Storage;
  constructor(props: Storage | StorageModel) {
    let valid: Storage;
    if (props instanceof StorageModel) {
      valid = StorageModel.schema.parse(props.props);
    } else {
      valid = StorageModel.schema.parse(props);
    }
    this._props = valid;
  }

  get props() {
    return structuredClone(this._props);
  }

  update(props: z.infer<typeof StorageModel.UpdateSchema>) {
    const valid = StorageModel.schema.parse({
      ...this._props,
      ...props,
    });
    this._props = valid;
    return this;
  }

  delete() {
    this._props.archivedAt = new Date().toISOString();
    return this;
  }

  // ============================= Static methods ============================= //
  protected static DEFAULT_NAME = 'New Storage';
  static readonly schema = Storage;
  static readonly CreateSchema = StorageModel.schema.partial().required({
    ownerId: true,
    refId: true,
  });

  static readonly UpdateSchema = StorageModel.schema.omit({
    id: true,
    createdAt: true,
    modifiedAt: true,
    archivedAt: true,
  });

  static create(props: z.infer<typeof StorageModel.CreateSchema>) {
    return new StorageModel({
      id: uuid(),
      used: 0,
      name: StorageModel.DEFAULT_NAME,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      archivedAt: null,
      metadata: {},
      ...props,
    });
  }
}

export class MyStorage extends StorageModel {
  protected static DEFAULT_NAME = 'My Storage';
}
