import { HealthController } from './health.controller';

import { FolderGrpcController, StorageGrpcController } from './grpc';
import { FolderRestController, StorageRestController } from './restfull';
import { StorageRmqController } from './rmq';

export const controllers = [
  HealthController,
  // -- restfull
  FolderRestController,
  StorageRestController,
  // -- grpc
  FolderGrpcController,
  StorageGrpcController,
  // -- rmq
  StorageRmqController,
];
