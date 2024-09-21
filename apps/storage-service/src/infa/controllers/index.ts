import { StorageGrpcController } from './storage.grpc-controller';
import { ContentRestController } from './content.rest-controller';
import { StorageRestController } from './storage.rest-controller';

export const controllers = [
  StorageGrpcController,
  ContentRestController,
  StorageRestController,
];
