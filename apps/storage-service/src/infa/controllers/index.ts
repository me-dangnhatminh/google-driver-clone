import { StorageGrpcController } from './storage.grpc-controller';
import { ContentRestController } from './content.rest-controller';
import { StorageRestController } from './storage.rest-controller';
import { StorageRestControllerV2 } from './storage.rest-controller.v2';

export const controllers = [
  StorageRestControllerV2,
  StorageGrpcController,
  ContentRestController,
  StorageRestController,
];
