import { AddFileHandler } from './file-add.cmd';
import { FileUpdateHandler } from './file-update.cmd';
import { FileUploadHandler } from './file-upload.cmd';
import { HardDeleteItemHandler } from './item-hard-delete.cmd';

export * from './file-update.cmd';
export * from './file-add.cmd';
export * from './file-upload.cmd';
export * from './file-update.cmd';

export * from './folder-update.cmd';
export * from './folder-add.cmd';
export * from './folder-create.cmd';

export * from './item-hard-delete.cmd';

export const commands = [
  AddFileHandler,
  FileUpdateHandler,
  FileUploadHandler,
  FileUpdateHandler,
  HardDeleteItemHandler,
];

export default commands;
