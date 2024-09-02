import { HealthController } from './health.controller';
import { UserRESTController } from './user.rest-controller';
import { UserGrpcController } from './user.grpc-controller';

export const controllers = [
  HealthController,
  UserGrpcController,
  UserRESTController,
];
export default controllers;
