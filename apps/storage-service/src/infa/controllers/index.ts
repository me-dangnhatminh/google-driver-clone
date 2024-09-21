import { StorageGrpcController } from './storage.grpc-controller';
import { ContentRestController } from './content.rest-controller';
import { StorageRestController } from './storage.rest-controller';
import { StorageRmqController } from './storage.rmq-controller';

export const controllers = [
  StorageGrpcController,
  ContentRestController,
  StorageRestController,
  StorageRmqController,
];
