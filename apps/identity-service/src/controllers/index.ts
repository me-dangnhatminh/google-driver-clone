import { RootController } from './root.controller';
import { AuthController } from './auth.controller';
import { HealthController } from './health.controller';

export * from './auth.controller';
export * from './health.controller';

export const controllers = [RootController, AuthController, HealthController];
export default controllers;
