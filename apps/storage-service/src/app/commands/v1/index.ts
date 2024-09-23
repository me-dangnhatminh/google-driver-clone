import { FileAddHandler } from './file-add.cmd';
import { FileUpdateHandler } from './file-update.cmd';
import { FileUploadHandler } from './file-upload.cmd';
import { FolderAddContentHandler } from './folder-add-content';
import { FolderAddHandler } from './folder-add.cmd';
import { FolderCreateHandler } from './folder-create.cmd';
import { FolderUpdateHandler } from './folder-update.cmd';
import { HardDeleteItemHandler } from './item-hard-delete.cmd';

export * from './file-update.cmd';
export * from './file-add.cmd';
export * from './file-upload.cmd';
export * from './file-update.cmd';

export * from './folder-update.cmd';
export * from './folder-add.cmd';
export * from './folder-add-content';
export * from './folder-create.cmd';

export * from './item-hard-delete.cmd';

export const commands = [
  FileAddHandler,
  FileUpdateHandler,
  FileUploadHandler,
  FileUpdateHandler,

  HardDeleteItemHandler,

  FolderAddHandler,
  FolderAddContentHandler,
  FolderCreateHandler,
  FolderUpdateHandler,
  FolderUpdateHandler,
];

export default commands;
