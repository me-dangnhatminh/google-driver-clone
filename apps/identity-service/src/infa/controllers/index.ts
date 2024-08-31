import { HttpController } from './http.controller';
import { UserGrpcController } from './user.grpc-controller';

export * from './auth.controller';

export const controllers = [UserGrpcController, HttpController];
export default controllers;
