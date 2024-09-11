import { FileContentHandler } from './file-content.query';
import { FolderContentHandler } from './folder-content.query';
import { FolderDownloadHandler } from './folder-download.query';

export * from './file-content.query';
export * from './folder-content.query';
export * from './folder-download.query';

export const queries = [
  FileContentHandler,
  FolderContentHandler,
  FolderDownloadHandler,
];
export type Queries = (typeof queries)[number];
export default queries;
