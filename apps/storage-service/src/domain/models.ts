import * as z from 'zod';

export type UUID = z.infer<typeof UUID>;
export type Bytes = z.infer<typeof Bytes>;
export type PastTime = z.infer<typeof PastTime>;
export type FileRef = z.infer<typeof FileRef>;
export type Folder = z.infer<typeof Folder>;
export type FolderInfo = z.infer<typeof FolderInfo>;
export type RootFolder = z.infer<typeof RootFolder>;
export type MyStorage = z.infer<typeof MyStorage>;

export type Owner = z.infer<typeof Owner>;
export type Viewer = z.infer<typeof Viewer>;
export type Editor = z.infer<typeof Editor>;
export type Admin = z.infer<typeof Admin>;
export type Accessor = z.infer<typeof Accessor>;

// ============================= Schemas ============================= //
export const UUID = z.string().uuid();
export const OnwerId = z.string();
export const Bytes = z.coerce.number().min(0);
export const PastTime = z.date().refine((d) => d <= new Date());

export const FileRef = z.object({
  id: UUID,
  name: z.string(),
  size: Bytes,
  createdAt: PastTime.default(() => new Date()),
  pinnedAt: PastTime.nullable().default(null),
  modifiedAt: PastTime.nullable().default(null),
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
  pinnedAt: PastTime.nullable().default(null),
  modifiedAt: PastTime.nullable().default(null),
  archivedAt: PastTime.nullable().default(null),
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
  refId: UUID,
  createdAt: PastTime.default(() => new Date()),
  modifiedAt: PastTime.nullable().default(null),
  archivedAt: PastTime.nullable().default(null),
});

// ========= Access control ========= //
export const Accessor = z.object({ id: UUID });
export const Owner = Accessor.brand('Owner');
export const Viewer = Accessor.brand('Viewer');
export const Editor = Accessor.brand('Editor');
export const Admin = Accessor.brand('Admin');

export type ResourceTypes = FolderInfo | Folder | FileRef;
export type AccessorTypes = Accessor | Owner | Viewer | Editor | Admin;
export type PermissionWrapper<
  A extends AccessorTypes = AccessorTypes,
  R extends ResourceTypes = ResourceTypes,
  Meta = unknown,
> = Readonly<{
  accessor: A;
  resource: R;
  meta: Meta;
}>;

const isOwner = <
  A extends AccessorTypes = AccessorTypes,
  R extends ResourceTypes = ResourceTypes,
  Meta = unknown,
>(
  accessor: A,
  resource: R,
  meta: Meta,
): PermissionWrapper<Owner, R, Meta> | null => {
  const isOwner = accessor['id'] === resource['ownerId'];
  if (!isOwner) return null;
  return structuredClone({ accessor: Owner.parse(accessor), resource, meta });
};

export const Permissions = {
  isOwner,
} as const;
