import { HealthController } from './health.controller';
import { AuthGrpcController } from './auth.grpc-controller';
import { UserGrpcController } from './user.grpc-controller';

import { UserRestController } from './user.rest-controller';
import { AuthRestController } from './auth.rest-controller';

export const controllers = [
  HealthController,

  AuthGrpcController,
  UserGrpcController,

  AuthRestController,
  UserRestController,
];
export default controllers;
