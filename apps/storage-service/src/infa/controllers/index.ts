import { StorageGrpcController } from './storage.grpc-controller';
import { ContentRestController } from './content.rest-controller';
import { StorageRestController } from './storage.rest-controller';
import { StorageRmqController } from './storage.rmq-controller';
import { HealthController } from './health.controller';

import { FolderGrpcController } from './grpc';

import { FolderRestController } from './restfull';

export const controllers = [
  FolderRestController,
  FolderGrpcController,
  HealthController,
  StorageGrpcController,
  ContentRestController,
  StorageRestController,
  StorageRmqController,
];
