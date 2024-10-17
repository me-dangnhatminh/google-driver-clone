import z from "zod";
import Api, { RequestOptions } from "./api";
import { ApiMethod } from "./api-method";

const folderMethods = {
  get: ApiMethod.make({ method: "GET", fullPath: "v1/storage/folder/{id}" }),
  list: ApiMethod.make({ method: "GET", fullPath: "v1/storage/folder" }),
  create: ApiMethod.make({ method: "POST", fullPath: "v1/storage/folder" }),
  update: ApiMethod.make({
    method: "PATCH",
    fullPath: "v1/storage/folder/{id}",
  }),
  delete: ApiMethod.make({
    method: "DELETE",
    fullPath: "v1/storage/folder/{id}",
  }),
  content: ApiMethod.make({
    method: "GET",
    fullPath: "v1/storage/folder/{id}/content",
  }),
  upload: ApiMethod.make({
    method: "POST",
    fullPath: "v1/storage/folder/{id}/content:upload",
  }),
};

const fileMethods = {
  get: ApiMethod.make({ method: "GET", fullPath: "v1/storage/file/{id}" }),
  list: ApiMethod.make({ method: "GET", fullPath: "v1/storage/file" }),
  create: ApiMethod.make({ method: "POST", fullPath: "v1/storage/file" }),
  update: ApiMethod.make({ method: "PATCH", fullPath: "v1/storage/file" }),
  delete: ApiMethod.make({ method: "DELETE", fullPath: "v1/storage/file" }),
};

const storageMethods = {
  myStorage: ApiMethod.make({
    method: "GET",
    fullPath: "v1/storage/my-storage",
  }),
  get: ApiMethod.make({ method: "GET", fullPath: "v1/storage/{id}" }),
  list: ApiMethod.make({ method: "GET", fullPath: "v1/storage" }),
  create: ApiMethod.make({ method: "POST", fullPath: "v1/storage" }),
  update: ApiMethod.make({ method: "PATCH", fullPath: "v1/storage" }),
  delete: ApiMethod.make({ method: "DELETE", fullPath: "v1/storage" }),
  folder: folderMethods,
  file: fileMethods,
};

const buildFilter = (filter: Record<string, unknown>) => {
  const parts: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const build = (obj: Record<string, any>, prefix = "") => {
    for (const key in obj) {
      if (typeof obj[key] === "object") build(obj[key], `${prefix}[${key}]`);
      else parts.push(`filter${prefix}[${key}]=${obj[key]}`);
    }
  };
  build(filter);
  if (parts.length) return parts.join("&");
  return "";
};

const buildPaginate = (limit?: number, offset?: string) => {
  const parts = [];
  if (limit) parts.push(`limit=${limit}`);
  if (offset) parts.push(`offset=${offset}`);
  if (parts.length) return parts.join("&");
  return "";
};

const buildSort = (sort: Record<string, string>) => {
  const parts = [];
  for (const key in sort) parts.push(`${key}:${sort[key]}`);
  if (parts.length) return parts.join(",");
  return "";
};

const buildQuery = (
  query: {
    limit?: number;
    offset?: string;
    filter?: Record<string, unknown>;
    sort?: Record<string, string>;
  } = {}
) => {
  const parts = [];
  if (query.filter) parts.push(buildFilter(query.filter));
  if (query.sort) parts.push(`sort=${buildSort(query.sort)}`);
  parts.push(buildPaginate(query.limit, query.offset));

  const notEmpty = parts
    .map((part) => part.trim())
    .filter((part) => part.length);
  if (!notEmpty.length) return "";
  return `?${notEmpty.join("&")}`;
};

// ============= SCHEMA =============
export type Storage = z.infer<typeof StorageSchema>;
export type Folder = z.infer<typeof FolderSchema>;
export type FolderCreateParams = z.infer<typeof FolderCreateSchema>;
export type FolderUpdateParams = z.infer<typeof FolderUpdateSchema>;
export type FolderContentItem = z.infer<typeof FolderContentItemSchema>;
export type FolderContent = z.infer<typeof FolderContentSchema>;

export const StorageSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  used: z.coerce.number(),
  limit: z.coerce.number().optional(),
});

export const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string().optional(),
  parentId: z.string().optional(),
  createdAt: z.string().optional(),
  modifiedAt: z.string().optional(),
});

export const FolderCreateSchema = FolderSchema.partial().required({
  name: true,
  parentId: true,
});

export const FolderContentItemSchema = z.object({
  id: z.string(),
  kind: z.union([z.literal("folder"), z.literal("file")]).optional(),
  name: z.string(),
  ownerId: z.string().optional(),
  parentId: z.string().optional(),
  createdAt: z.string().optional(),
  modifiedAt: z.string().optional(),
  pinnedAt: z.string().optional(),
  archivedAt: z.string().optional(),
  size: z.coerce.number().optional(),
  owner: z
    .object({
      email: z.string(),
      id: z.string().optional(),
      picture: z.string().optional(),
    })
    .optional(),
});

export const FolderContentSchema = z.object({
  items: z.array(FolderContentItemSchema),
  total: z.coerce.number(),
  limit: z.coerce.number().optional(),
});

export const FolderUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  parentId: z.string().optional(),
  ownerId: z.string().optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export class StorageApi extends Api {
  list(
    params?: { [key: string]: string },
    query?: {
      limit?: number;
      offset?: string;
      filter?: Record<string, string>;
      sort?: Record<string, string>;
    },
    options?: RequestOptions
  ) {
    const queryPath = buildQuery(query);
    const fullPath = storageMethods.list.makePath(params || {});
    const url = fullPath + queryPath;
    return this.get(url, undefined, options);
  }

  myStorage(options?: RequestOptions) {
    const fullPath = storageMethods.myStorage.makePath();
    return Api.get(fullPath, undefined, options);
  }

  getStorage(params: { id: string }, options?: RequestOptions) {
    const fullPath = storageMethods.get.makePath(params);
    return this.get(fullPath, undefined, options).then((res) => {
      return StorageSchema.parse(res.data);
    });
  }

  getFolder(params: { id: string }, options?: RequestOptions) {
    const fullPath = folderMethods.get.makePath(params);
    return this.get(fullPath, undefined, options).then((res) => {
      return FolderSchema.parse(res.data);
    });
  }

  folderContent(
    params: {
      id: string;
      limit?: number;
      offset?: string;
      filter?: Record<string, unknown>;
      sort?: Record<string, string>;
    },
    options?: RequestOptions
  ) {
    const { id, ...query } = params;
    const queryPath = buildQuery(query);
    const fullPath = storageMethods.folder.content.makePath({ id });
    const url = fullPath + queryPath;
    return this.get(url, undefined, options).then(({ data }) => {
      return FolderContentSchema.parse(data);
    });
  }

  createFolder(params: FolderCreateParams, options?: RequestOptions) {
    const fullPath = folderMethods.create.makePath();
    return this.post(fullPath, params, options);
  }

  deleteFolder(params: { id: string }, options?: RequestOptions) {
    const fullPath = folderMethods.delete.makePath(params);
    return this.delete(fullPath, undefined, options);
  }

  uploadFiles(
    params: {
      id: string;
      files: [File, ...File[]];
    },
    options?: RequestOptions
  ) {
    const { files, ...rest } = params;
    const fullPath = storageMethods.folder.upload.makePath(rest);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file, encodeURIComponent(file.name));
    });
    return this.post(fullPath, formData, options);
  }

  updateFolder(
    params: {
      id: string;
      name?: string;
      parentId?: string;
      ownerId?: string;
      pinned?: boolean;
      archived?: boolean;
    },
    options?: RequestOptions
  ) {
    const { id, ...rest } = params;
    const fullPath = folderMethods.update.makePath({ id });
    return this.patch(fullPath, rest, undefined, options);
  }

  updateFile(
    params: {
      id: string;
      name?: string;
      parentId?: string;
      ownerId?: string;
      pinned?: boolean;
      archived?: boolean;
    },
    options?: RequestOptions
  ) {
    const fullPath = fileMethods.update.makePath(params);
    return this.patch(fullPath, undefined, options);
  }

  deleteFile(params: { id: string }, options?: RequestOptions) {
    const fullPath = fileMethods.delete.makePath(params);
    return this.delete(fullPath, undefined, options);
  }

  private static storageApi = new StorageApi();
  static list = StorageApi.storageApi.list;
  static myStorage = StorageApi.storageApi.myStorage;
  static getStorage = StorageApi.storageApi.getStorage;
  static getFolder = StorageApi.storageApi.getFolder;
  static folderContent = StorageApi.storageApi.folderContent;
  static createFolder = StorageApi.storageApi.createFolder;
  static uploadFiles = StorageApi.storageApi.uploadFiles;
  static deleteFolder = StorageApi.storageApi.deleteFolder;
  static updateFolder = StorageApi.storageApi.updateFolder;
}
