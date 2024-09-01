import { HealthController } from './health.controller';
import { HttpController } from './http.controller';
import { UserGrpcController } from './user.grpc-controller';

export const controllers = [
  HealthController,
  UserGrpcController,
  HttpController,
];
export default controllers;
