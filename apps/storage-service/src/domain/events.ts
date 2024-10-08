import { FileRef, Folder, FolderInfo, MyStorage } from './models';

export type BaseEvent<T extends string, D = unknown> = {
  type: T;
  data: D;
};

export const EventTypes = {
  storage_initialised: 'storage_initialised',
  file_added: 'file_added',
  file_created: 'file_created',
  file_updated: 'file_updated',
  file_deleted: 'file_deleted',

  folder_added: 'folder_added',
  folder_created: 'folder_created',
  folder_updated: 'folder_updated',
  folder_deleted: 'folder_deleted',
} as const;

export type TStorageInitialisedEvent = BaseEvent<
  typeof EventTypes.storage_initialised,
  MyStorage
>;
export type TFileAddedEvent = BaseEvent<typeof EventTypes.file_added, FileRef>;
export type TFileCreatedEvent = BaseEvent<
  typeof EventTypes.file_created,
  FileRef
>;
export type TFileUpdatedEvent = BaseEvent<
  typeof EventTypes.file_updated,
  FileRef
>;

export type TFileDeletedEvent = BaseEvent<
  typeof EventTypes.file_deleted,
  string[]
>;

export type TFolderAddedEvent = BaseEvent<
  typeof EventTypes.folder_added,
  Folder
>;

export type TFolderCreatedEvent = BaseEvent<
  typeof EventTypes.folder_created,
  FolderInfo
>;

export type TFolderUpdatedEvent = BaseEvent<
  typeof EventTypes.folder_updated,
  FolderInfo
>;

export type TFolderDeletedEvent = BaseEvent<
  typeof EventTypes.folder_deleted,
  { files: string[]; folders: string[] }
>;

export type TStorageEvent =
  | TStorageInitialisedEvent
  | TFileAddedEvent
  | TFileCreatedEvent
  | TFileUpdatedEvent
  | TFileDeletedEvent
  | TFolderAddedEvent
  | TFolderCreatedEvent
  | TFolderUpdatedEvent
  | TFolderDeletedEvent;
export class StorageEvent<T extends TStorageEvent> {
  public readonly type: T['type'];
  public readonly data: T['data'];
  constructor(event: T) {
    this.type = event.type;
    this.data = event.data;
  }

  static fromEvent(event: TStorageEvent) {
    return new StorageEvent(event);
  }

  tuple() {
    return [this.type, this] as const;
  }
}
