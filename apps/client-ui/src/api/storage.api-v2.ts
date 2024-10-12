import Api, { RequestOptions } from "./api";
import { ApiMethod } from "./api-method";

const folderMethods = {
  get: ApiMethod.make({ method: "GET", fullPath: "v1/storage/folder/{id}" }),
  list: ApiMethod.make({ method: "GET", fullPath: "v1/storage/folder" }),
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
  get: ApiMethod.make({ method: "GET", fullPath: "v1/storage/{id}" }),
  list: ApiMethod.make({ method: "GET", fullPath: "v1/storage" }),
  create: ApiMethod.make({ method: "POST", fullPath: "v1/storage" }),
  update: ApiMethod.make({ method: "PATCH", fullPath: "v1/storage" }),
  delete: ApiMethod.make({ method: "DELETE", fullPath: "v1/storage" }),
  folder: folderMethods,
  file: fileMethods,
};

const buildFilter = (filter: Record<string, string | number>) => {
  const parts = [];
  for (const key in filter) parts.push(`filter[${key}]=${filter[key]}`);
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
  filter?: Record<string, string>;
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

export class StorageApi extends Api {
  getStorage(params: { id: string }, options?: RequestOptions) {
    const fullPath = storageMethods.get.makePath(params);
    return this.get(fullPath, undefined, options);
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
}
