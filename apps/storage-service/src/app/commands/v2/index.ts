import { CreateFolderHandler } from './folder-create.command';
import { DeleteFolderHandler } from './folder-delete.command';
import { RemoveFolderHandler } from './folder-remove.command';
import { UpdateFolderHandler } from './folder-update.command';

export * from './folder-create.command';
export * from './folder-delete.command';
export * from './folder-update.command';

export const commands = [
  CreateFolderHandler,
  RemoveFolderHandler,
  DeleteFolderHandler,
  UpdateFolderHandler,
  //TODO: miss Move, Copy
];
export default commands;
