import { StorageDiskService } from './storage-disk.service';
import { StorageService } from './storage.service';

export * from './storage-disk.service';
export * from './storage.service';

export const services = [StorageDiskService, StorageService];
export default services;
