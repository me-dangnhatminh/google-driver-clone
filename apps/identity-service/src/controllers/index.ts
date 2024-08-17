import { RootController } from './root.controller';
import { AuthController } from './auth.controller';
import { HealthController } from './health.controller';
import { HttpController } from './http.controller';

export * from './auth.controller';
export * from './health.controller';

export const controllers = [
  RootController,
  AuthController,
  HealthController,
  HttpController,
];
export default controllers;
