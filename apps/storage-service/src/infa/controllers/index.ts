import { StorageGrpcController } from './storage.grpc-controller';
import { ContentRestController } from './content.rest-controller';
import { StorageRestController } from './storage.rest-controller';
import { StorageRmqController } from './storage.rmq-controller';
import { HealthController } from './health.controller';

export const controllers = [
  HealthController,
  StorageGrpcController,
  ContentRestController,
  StorageRestController,
  StorageRmqController,
];
