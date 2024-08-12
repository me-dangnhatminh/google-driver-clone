import { util } from 'zod';

export const AppCode = util.arrayToEnum([
  'success',
  'unknown',
  'invalid_request',
  'invalid_token',
  'invalid_scope',
  'invalid_client',
]);

export type AppCode = keyof typeof AppCode;
