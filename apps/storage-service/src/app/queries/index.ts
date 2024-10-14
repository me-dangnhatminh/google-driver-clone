import { GetStorageHandler } from './get-storage.query';
import { FileContentHandler } from './file-content.query';
import { MyFolderContentHandler } from './my-folder-content.query';
import { FolderDownloadHandler } from './folder-download.query';
import { ContentFolderHandler } from './folder-content.query';
import { GetFolderHandler } from './folder-get.query';
import { ListFolderHandler } from './folder-list.query';

export * from './get-storage.query';
export * from './file-content.query';
export * from './my-folder-content.query';
export * from './folder-download.query';
export * from './folder-content.query';
export * from './folder-get.query';
export * from './folder-list.query';

export const queries = [
  ContentFolderHandler,
  GetFolderHandler,
  ListFolderHandler,
  // DownloadFolderHandler,

  GetStorageHandler,
  FileContentHandler,
  MyFolderContentHandler,
  FolderDownloadHandler,
];
export type Queries = (typeof queries)[number];
export default queries;
