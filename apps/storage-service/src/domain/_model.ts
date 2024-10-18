import z from 'zod';
import { randomUUID as uuid } from 'crypto';

export type UUID = z.infer<typeof UUID>;
export type Bytes = z.infer<typeof Bytes>;
export type ISOString = z.infer<typeof ISOString>;
export type FileSchema = z.infer<typeof FileSchema>;
export type FolderSchema = z.infer<typeof FolderSchema>;
export type OnwerSchema = z.infer<typeof OnwerSchema>;
export type StorageSchema = z.infer<typeof StorageSchema>;

export const UUID = z.string().uuid();
export const ISOString = z.coerce.date().transform((d) => d.toISOString());
export const Bytes = z.coerce.number().min(0);

export const OnwerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  picture: z.string().optional(),
});

export const FileSchema = z.object({
  id: UUID,
  name: z.string(),
  size: Bytes,
  owner: z.union([OnwerSchema, z.string()]).optional(),
  content_type: z.string(),
  folder_id: z.string(),
  path: z.string().optional(),

  created: ISOString,
  updated: ISOString,
  deleted: ISOString.optional(),

  metadata: z.record(z.unknown()).default({}),
});

export const FolderSchema = z.object({
  id: UUID,
  name: z.string(),
  size: Bytes,
  owner: z.union([OnwerSchema, z.string()]).optional(),
  parent_id: z.string().nullable(),
  created: ISOString,
  updated: ISOString,
  deleted: ISOString.optional(),
  metadata: z.record(z.unknown()).default({}),

  files: z.lazy(() => z.array(FileSchema)).optional(),
  folders: z.lazy(() => z.array(FolderSchema)).optional(),
});

export const StorageSchema = z.object({
  id: UUID,
  name: z.string(),
  used: Bytes,
  limit: Bytes.optional(),

  owner: z.union([OnwerSchema, z.string()]),
  root: z.union([FolderSchema, z.string()]),
  created: ISOString,
  updated: ISOString,
  deleted: ISOString.optional(),
  metadata: z.record(z.unknown()).default({}),
});

export class FileRef {
  static readonly schema = FileSchema;
  protected _props: FileSchema;
  constructor(props: FileSchema | FileRef) {
    let valid: FileSchema;
    if (props instanceof FileRef) valid = FileRef.schema.parse(props.props);
    else valid = FileRef.schema.parse(props);
    this._props = valid;
  }

  static new(props: FileSchema) {
    return new FileRef(FileSchema.parse(props));
  }

  get props() {
    return structuredClone(this._props);
  }
}

export class Folder {
  static readonly schema = FolderSchema;
  protected _props: FolderSchema;
  constructor(props: FolderSchema | Folder) {
    let valid: FolderSchema;
    if (props instanceof Folder) {
      valid = Folder.schema.parse(props.props);
    } else {
      valid = Folder.schema.parse(props);
    }
    this._props = valid;
  }

  static new(props: FolderSchema | Folder) {
    return new Folder(props);
  }

  get props() {
    return structuredClone(this._props);
  }

  get files() {
    return structuredClone(this._props.files);
  }

  get folders() {
    return structuredClone(this._props.folders);
  }

  get content() {
    const files = this.files?.map((f) => ({ ...f, kind: 'file' }));
    const folders = this.folders?.map((f) => ({ ...f, kind: 'folder' }));
    const content: (
      | (Folder & { kind: 'folder' })
      | (FileRef & { kind: 'file' })
    )[] = [...(files || []), ...(folders || [])];
    return content;
  }

  addFile(file: FileRef) {
    const valid = FileSchema.parse(file.props);
    if (!this._props.files) this._props.files = [];
    this._props.files.push(valid);
  }

  addFiles(files: FileRef[]) {
    const valids = FileSchema.array().parse(files);
    if (!this._props.files) this._props.files = [];
    this._props.files.push(...valids);
  }

  addFolder(folder: Folder) {
    const valid = FolderSchema.parse(folder.props);
    if (!this._props.folders) this._props.folders = [];
    this._props.folders.push(valid);
  }

  addFolders(folders: Folder[]) {
    const valids = FolderSchema.array().parse(folders);
    if (!this._props.folders) this._props.folders = [];
    this._props.folders.push(...valids);
  }

  removeFile(id: string) {
    if (!this._props.files) return;
    this._props.files = this._props.files.filter((f) => f.id !== id);
  }

  removeFolder(id: string) {
    if (!this._props.folders) return;
    this._props.folders = this._props.folders.filter((f) => f.id !== id);
  }

  getFolder(id: string): Folder | undefined {
    if (!this._props.folders) return;
    const folder = this._props.folders.find((f) => f.id === id);
    if (!folder) return;
    return Folder.new(folder);
  }

  removeThis() {
    this._props.deleted = new Date().toISOString();
  }
}

export class Storage {
  static readonly schema = StorageSchema;
  protected _props: StorageSchema;

  constructor(props: StorageSchema | Storage) {
    let valid: StorageSchema;
    if (props instanceof Storage) {
      valid = Storage.schema.parse(props.props);
    } else {
      valid = Storage.schema.parse(props);
    }
    this._props = valid;
  }

  get props() {
    return structuredClone(this._props);
  }

  static new(props: StorageSchema | Storage) {
    return new Storage(props);
  }
}
// ============================== Factory ============================== //

export class FileRefFactory extends FileRef {
  protected static DEFAULT_NAME = 'New File';

  static readonly CreateSchema = FileSchema.partial().required({
    owner: true,
    folder_id: true,
    content_type: true,
    size: true,
  });

  static readonly UpdateSchema = FileSchema.partial().required({ id: true });

  static create(props: z.infer<typeof FileRefFactory.CreateSchema>) {
    return new FileRefFactory({
      id: uuid(),
      name: FileRefFactory.DEFAULT_NAME,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      metadata: {},
      ...props,
    });
  }

  update(props: z.infer<typeof FileRefFactory.UpdateSchema>) {
    const valid = FileSchema.parse({
      ...this._props,
      ...props,
      updated: new Date().toISOString(),
    });
    this._props = valid;
    return this;
  }

  delete() {
    this._props.deleted = new Date().toISOString();
    return this;
  }
}

export class FolderFactory extends Folder {
  protected static DEFAULT_NAME = 'New Folder';

  static readonly CreateSchema = Folder.schema.partial().required({
    owner: true,
    root: true,
  });

  static readonly UpdateSchema = Folder.schema.partial().required({ id: true });

  static create(props: z.infer<typeof FolderFactory.CreateSchema>) {
    return new FolderFactory({
      id: uuid(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      name: FolderFactory.DEFAULT_NAME,
      size: 0,
      metadata: {},
      ...props,
    });
  }

  update(props: z.infer<typeof FolderFactory.UpdateSchema>) {
    const valid = Folder.schema.parse({
      ...this._props,
      ...props,
      updated: new Date().toISOString(),
    });
    this._props = valid;
    return this;
  }

  delete() {
    this._props.deleted = new Date().toISOString();
    return this;
  }
}

export class StorageFactory extends Storage {
  protected static DEFAULT_NAME = 'New Storage';

  static readonly CreateSchema = Storage.schema.partial().required({
    owner: true,
    root: true,
  });

  static readonly UpdateSchema = Storage.schema
    .partial()
    .required({ id: true });

  static create(props: z.infer<typeof StorageFactory.CreateSchema>) {
    return new StorageFactory({
      id: uuid(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      name: StorageFactory.DEFAULT_NAME,
      used: 0,
      metadata: {},
      ...props,
    });
  }

  update(props: z.infer<typeof StorageFactory.UpdateSchema>) {
    const valid = Storage.schema.parse({
      ...this._props,
      ...props,
      updated: new Date().toISOString(),
    });
    this._props = valid;
    return this;
  }

  delete() {
    this._props.deleted = new Date().toISOString();
    return this;
  }
}

export class MyStorage extends StorageFactory {
  protected static DEFAULT_NAME = 'My Storage';
}
