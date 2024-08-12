import { SetMetadata } from '@nestjs/common';

export const AUTH_REQUIRED_KEY = 'auth-required';

export const AuthRequired = (required: boolean = true) => {
  return SetMetadata(AUTH_REQUIRED_KEY, required);
};
