import { GetStorageHandler } from './get-storage.query';
import { FileContentHandler } from './file-content.query';
import { MyFolderContentHandler } from './my-folder-content.query';
import { FolderDownloadHandler } from './folder-download.query';

export * from './get-storage.query';
export * from './file-content.query';
export * from './my-folder-content.query';
export * from './folder-download.query';

export const queries = [
  GetStorageHandler,
  FileContentHandler,
  MyFolderContentHandler,
  FolderDownloadHandler,
];
export type Queries = (typeof queries)[number];
export default queries;
