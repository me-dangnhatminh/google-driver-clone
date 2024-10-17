import z from "zod";
import Api, { RequestOptions } from "./api";
import { ApiMethod } from "./api-method";

const folderMethods = {
  get: ApiMethod.make({ method: "GET", fullPath: "v1/storage/folder/{id}" }),
  list: ApiMethod.make({ method: "GET", fullPath: "v1/storage/folder" }),
  content: ApiMethod.make({
    method: "GET",
    fullPath: "v1/storage/folder/{id}/content",
  }),
  create: ApiMethod.make({ method: "POST", fullPath: "v1/storage/folder" }),
  update: ApiMethod.make({ method: "PATCH", fullPath: "v1/storage/folder" }),
  delete: ApiMethod.make({ method: "DELETE", fullPath: "v1/storage/folder" }),
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

const buildQuery = (query: {
  limit?: number;
  offset?: string;
  filter?: Record<string, unknown>;
  sort?: Record<string, string>;
}) => {
  const parts = [];
  if (query.filter) parts.push(buildFilter(query.filter));
  if (query.sort) parts.push(`sort=${buildSort(query.sort)}`);
  parts.push(buildPaginate(query.limit, query.offset));
  return parts
    .map((part) => part.trim())
    .filter((part) => part.length)
    .join("&");
};

// ============= SCHEMA =============
export const StorageSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  used: z.coerce.number(),
  limit: z.coerce.number().optional(),
});
export type Storage = z.infer<typeof StorageSchema>;

export const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string().optional(),
  parentId: z.string().optional(),
  createdAt: z.string().optional(),
  modifiedAt: z.string().optional(),
});

export const FolderContentItemSchema = z.object({
  id: z.string(),
  kind: z.union([z.literal("folder"), z.literal("file")]).optional(),
  name: z.string(),
  ownerId: z.string().optional(),
  parentId: z.string().optional(),
  createdAt: z.string().optional(),
  modifiedAt: z.string().optional(),
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
  limit: z.coerce.number().optional(), // TODO: fix
});

export class StorageApi extends Api {
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
    const queryPath = query ? `?${buildQuery(query)}` : "";
    const fullPath = storageMethods.list.makePath(params || {});
    const url = fullPath + queryPath;
    return this.get(url, undefined, options);
  }

  createFolder(
    data: { name: string; parentId?: string },
    options?: RequestOptions
  ) {
    const fullPath = folderMethods.create.makePath();
    return this.post(fullPath, data, options);
  }

  private static storageApi = new StorageApi();
  static myStorage = StorageApi.storageApi.myStorage;
  static getStorage = StorageApi.storageApi.getStorage;
  static getFolder = StorageApi.storageApi.getFolder;
  static folderContent = StorageApi.storageApi.folderContent;
  static createFolder = StorageApi.storageApi.createFolder;
}
