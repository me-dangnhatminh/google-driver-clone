import * as z from 'zod';

export type UUID = z.infer<typeof UUID>;
export type Bytes = z.infer<typeof Bytes>;
export type PastTime = z.infer<typeof PastTime>;
export type FileRef = z.infer<typeof FileRef>;
export type Folder = z.infer<typeof Folder>;
export type FolderInfo = z.infer<typeof FolderInfo>;
export type FolderContent = z.infer<typeof FolderContent>;
export type RootFolder = z.infer<typeof RootFolder>;
export type MyStorage = z.infer<typeof MyStorage>;

// ============================= Schemas ============================= //
export const UUID = z.string().uuid();
export const OnwerId = z.string();
export const Bytes = z.coerce.number().min(0);
export const PastTime = z.coerce.date().refine((d) => d <= new Date());

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

  pinnedAt: PastTime.nullable().default(null),
  archivedAt: PastTime.nullable().default(null),
});

export const FolderContent = FolderInfo.extend({
  files: z.lazy(() => z.array(FileRef)),
  folders: z.lazy(() => z.array(FolderContent)),
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

export const MyStorage = z.object({
  id: UUID,
  ownerId: OnwerId,
  name: z.string().optional(),

  refId: UUID,
  used: Bytes.default(0),
  total: Bytes.default(0),

  metadata: z.record(z.string()).default({}),
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
