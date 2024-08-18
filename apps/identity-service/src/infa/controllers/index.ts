import { RootController } from './root.controller';
import { AuthController } from './auth.controller';
import { HttpController } from './http.controller';

export * from './auth.controller';

export const controllers = [RootController, AuthController, HttpController];
export default controllers;
