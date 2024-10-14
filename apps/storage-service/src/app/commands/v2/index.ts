import { CreateFolderHandler } from './folder-create.command';
import { DeleteFolderHandler } from './folder-delete.command';
import { UpdateFolderHandler } from './folder-update.command';

export * from './folder-create.command';
export * from './folder-delete.command';
export * from './folder-update.command';

export const commands = [
  CreateFolderHandler,
  UpdateFolderHandler,
  DeleteFolderHandler,
];
export default commands;
