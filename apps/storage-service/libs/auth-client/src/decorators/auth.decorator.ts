import { AUTH_REQUIRED_METADATA_KEY } from '../constants';

export const AuthRequired = (required = true): MethodDecorator => {
  return Reflect.metadata(AUTH_REQUIRED_METADATA_KEY, required);
};
