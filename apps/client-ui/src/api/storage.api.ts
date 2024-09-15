import { z } from "zod";
import Api from "./api";
import { AxiosRequestConfig } from "axios";
import FileUtils from "@/lib/file.utils";

// ============================ DTOs ============================ //
const UUID = z.string();
const Bytes = z.coerce.number().int().min(0);
const PastTime = z.coerce.date();

export const MyStorage = z.object({
  name: z.string(),
  total: Bytes,
  used: Bytes,
});
export const Owner = z.object({
  id: UUID,
  fullName: z.string(),
  email: z.string(),
  avatarURI: z.string().nullish(),
});
export const ItemLabel = z.enum(["pinned", "archived", "my"]).default("my");
export const FileRef = z.object({
  id: UUID,
  name: z.string(),
  owner: Owner.nullish(),
  size: Bytes.or(z.string()),
  contentType: z.string(),
  thumbnail: z.string().nullish(),
  description: z.string().nullish(),
  createdAt: PastTime,
  pinnedAt: PastTime.nullish(),
  modifiedAt: PastTime.nullish(),
  archivedAt: PastTime.nullish(),
});
export const FolderInfo = z.object({
  id: z.string(),
  name: z.string(),
  owner: Owner.nullish(),
  createdAt: PastTime,
  pinnedAt: PastTime.nullish(),
  modifiedAt: PastTime.nullish(),
  archivedAt: PastTime.nullish(),
});

export const FolderContent = FolderInfo.extend({
  content: z.object({
    files: z.array(FileRef),
    folders: z.array(FolderInfo),
  }),
});

export const CreateFolderDTO = z.object({ name: z.string() });

export const SortType = z.enum(["asc", "desc"]);
export const SortField = z.enum(["name", "createdAt", "modifiedAt"]);
export const Limit = z.number().int().min(10).max(100).default(10);

export const Pagination = z.object({
  limit: z.number().int().min(1).max(50).optional(),
  fileCursor: z.string().optional(),
  folderCursor: z.string().optional(),
});

export const GetFolderResponse = FolderContent.extend({
  nextCursor: z
    .object({
      fileCursor: z.string().optional(),
      folderCursor: z.string().optional(),
    })
    .optional(),
});

export type MyStorage = z.infer<typeof MyStorage>;
export type Owner = z.infer<typeof Owner>;
export type ItemLabel = z.infer<typeof ItemLabel>;
export type FileRef = z.infer<typeof FileRef>;
export type FolderInfo = z.infer<typeof FolderInfo>;
export type FolderContent = z.infer<typeof FolderContent>;
export type CreateFolderDTO = z.infer<typeof CreateFolderDTO>;

export type GetFolderResponse = z.infer<typeof GetFolderResponse>;
export type Pagination = z.infer<typeof Pagination>;

const Rename = z.object({ label: z.literal("rename"), name: z.string() });
const Archive = z.object({ label: z.literal("archive") });
const Pin = z.object({ label: z.literal("pin") });
const Unpin = z.object({ label: z.literal("unpin") });
const Unarchive = z.object({ label: z.literal("unarchive") });

export type Rename = z.infer<typeof Rename>;
export type Archive = z.infer<typeof Archive>;
export type Pin = z.infer<typeof Pin>;
export type Unpin = z.infer<typeof Unpin>;
export type Unarchive = z.infer<typeof Unarchive>;
export type UpdateItemDTO = (Rename | Archive | Pin | Unpin | Unarchive) & {
  id: string;
};

// ============================ APIs ============================ //

export class StorageApi extends Api {
  static readonly ROOT_ID = "root";
  static readonly URL = {
    MY_STORAGE: `${Api.baseURL}/storage`,
    UPLOAD_FILE: `${Api.baseURL}/storage/folders/:key/files/upload`,
    UPLOAD_FOLDER: `${Api.baseURL}/storage/folders/:key/upload`,
    DOWNLOAD_FILE: `${Api.baseURL}/storage/files/:key/download`,
    DOWNLOAD_FOLDER: `${Api.baseURL}/storage/folders/:key/download`,
    UPDATE_FILE: `${Api.baseURL}/storage/files/:key`,
    UPDATE_FOLDER: `${Api.baseURL}/storage/folders/:key`,
    FOLDER_CONTENT: `${Api.baseURL}/storage/folders/:key`,
    CREATE_FOLDER: `${Api.baseURL}/storage/folders/:key`,
    HARD_DELETE: `${Api.baseURL}/storage/items/:key`,
  } as const;

  static myStorage(config?: AxiosRequestConfig) {
    return Api.get(StorageApi.URL.MY_STORAGE, null, config).then((r) =>
      MyStorage.parse(r.data)
    );
  }

  static createFolder(
    req: CreateFolderDTO & { parentId?: string },
    config?: AxiosRequestConfig
  ) {
    const parentId = req.parentId ?? StorageApi.ROOT_ID;
    const url = StorageApi.URL.CREATE_FOLDER.replace(":key", parentId);
    return Api.post(url, req, null, config).then(() => {});
  }

  static getFolder(
    req: { id?: string; label?: ItemLabel; pagination?: Pagination } = {},
    config?: AxiosRequestConfig
  ) {
    const pagination = req?.pagination;
    const id = req?.id ?? StorageApi.ROOT_ID;
    const label = req?.label ?? "my";
    const url = StorageApi.URL.FOLDER_CONTENT.replace(":key", id);
    return Api.get(url, { label, ...pagination }, config).then((r) => {
      const res = GetFolderResponse.safeParse(r.data);
      if (res.success) return res.data;
      console.info(res.error.message);
      throw new Error("Failed to get folder content");
    });
  }

  static updateFolder(req: UpdateItemDTO, config?: AxiosRequestConfig) {
    const url = StorageApi.URL.UPDATE_FOLDER.replace(":key", req.id);
    return Api.patch(url, req, null, config).then(() => {});
  }

  static uploadFolder(
    req: { files: File[]; parentId?: string },
    config?: AxiosRequestConfig
  ) {
    const parentId = req.parentId ?? StorageApi.ROOT_ID;
    const files = req.files;
    const formData = new FormData();
    files.forEach((file) => {
      if (!file.webkitRelativePath) throw new Error("Invalid file path");
      if (file.webkitRelativePath === "") throw new Error("Invalid file path");
      const pathEncoded = encodeURIComponent(file.webkitRelativePath);
      formData.append("files", file, pathEncoded);
    });
    const url = StorageApi.URL.UPLOAD_FOLDER.replace(":key", parentId);
    const headers = { "Content-Type": "multipart/form-data" };
    return Api.post(url, formData, null, { headers, ...config }).then(() => {});
  }

  static async uploadFile(
    req: { file: File; parentId?: string },
    config?: AxiosRequestConfig
  ) {
    const parentId = req.parentId ?? StorageApi.ROOT_ID;
    const formData = new FormData();
    formData.append("file", req.file, encodeURIComponent(req.file.name));
    const headers = {
      "Content-Type": "multipart/form-data",
      "Cache-Control": "max-age=86400",
      "Content-Encoding": "gzip",
    };
    const url = StorageApi.URL.UPLOAD_FILE.replace(":key", parentId);
    return await Api.post(url, formData, undefined, { headers, ...config });
  }

  static updateFile(req: UpdateItemDTO, config?: AxiosRequestConfig) {
    const url = StorageApi.URL.UPDATE_FILE.replace(":key", req.id);
    return Api.patch(url, req, null, config).then(() => {});
  }

  static downloadFile(req: { id: string }, config?: AxiosRequestConfig) {
    const url = StorageApi.URL.DOWNLOAD_FILE.replace(":key", req.id);
    return Api.get(url, null, { responseType: "blob", ...config }).then(
      (res) => {
        const disposition = `${res.headers["content-disposition"]}`;
        const type = `${res.headers["content-type"]}`;
        const name = FileUtils.nameFromDisposition(disposition);
        const blob = new Blob([res.data as BlobPart], { type });
        return { data: blob, name: name ?? "unknown" };
      }
    );
  }

  static downloadThumbnail(uri: string) {
    return StorageApi.get(uri, { responseType: "blob" }).then((res) => {
      const type = `${res.headers["content-type"]}`;
      const blob = new Blob([res.data as BlobPart], { type });
      return { data: blob, name: "thumbnail" };
    });
  }

  static downloadFolder(
    req: { id: string; name?: string },
    config?: AxiosRequestConfig
  ) {
    // FIXME: dowload folder not work: zip file is corrupted
    const url = StorageApi.URL.DOWNLOAD_FOLDER.replace(":key", req.id);
    return Api.get(url, null, {
      responseType: "blob",
      headers: { "Content-Type": "application/json; application/octet-stream" },
      ...config,
    }).then((res) => {
      const disposition = `${res.headers["content-disposition"]}`;
      const type = `${res.headers["content-type"]}`.trim();
      const name = FileUtils.nameFromDisposition(disposition);
      const blobData = new Blob([res.data as BlobPart], { type });
      return { data: blobData, name: name ?? "unknown" };
    });
  }

  static urlDownloadFile(id: string) {
    const url = StorageApi.URL.DOWNLOAD_FILE.replace(":key", id);
    return Api.baseURL + url;
  }

  static urlDownloadFolder(id: string) {
    const url = StorageApi.URL.DOWNLOAD_FOLDER.replace(":key", id);
    return Api.baseURL + url;
  }

  static downloadURL(id: string, type: "file" | "folder") {
    return type === "file"
      ? StorageApi.urlDownloadFile(id)
      : StorageApi.urlDownloadFolder(id);
  }

  static hardDelete(req: { id: string; type: "file" | "folder" }) {
    const url = StorageApi.URL.HARD_DELETE.replace(":key", req.id);
    return Api.delete(url, { type: req.type }).then(() => {});
  }

  static getFolderURL(id: string) {
    return StorageApi.URL.FOLDER_CONTENT.replace(":key", id);
  }

  static fileUploadURL(id: string = StorageApi.ROOT_ID) {
    return StorageApi.URL.UPLOAD_FILE.replace(":key", id);
  }

  static folderUploadURL(id: string = StorageApi.ROOT_ID) {
    return StorageApi.URL.UPLOAD_FOLDER.replace(":key", id);
  }
}

export default StorageApi;
