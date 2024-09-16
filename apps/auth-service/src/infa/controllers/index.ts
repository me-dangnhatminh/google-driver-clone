import { HealthController } from './health.controller';
import { AuthGrpcController } from './auth.grpc-controller';
import { UserGrpcController } from './user.grpc-controller';

import { UserRestController } from './user.rest-controller';

export const controllers = [
  AuthGrpcController,
  HealthController,
  UserGrpcController,
  UserRestController,
];
export default controllers;
