import { AddContentFolderCommandHandler } from './folder-addcontent.command';
import { CreateFolderHandler } from './folder-create.command';
import { DeleteFolderHandler } from './folder-delete.command';
import { RemoveFolderHandler } from './folder-remove.command';
import { UpdateFolderHandler } from './folder-update.command';
import { CreateStorageHandler } from './storage-create.command';

export * from './folder-create.command';
export * from './folder-delete.command';
export * from './folder-update.command';
export * from './folder-addcontent.command';

export * from './storage-create.command';

export const commands = [
  CreateFolderHandler,
  RemoveFolderHandler,
  DeleteFolderHandler,
  UpdateFolderHandler,
  AddContentFolderCommandHandler,
  //TODO: miss Move, Copy

  CreateStorageHandler,
];
export default commands;
