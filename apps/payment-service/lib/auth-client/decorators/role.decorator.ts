import { SetMetadata } from '@nestjs/common';
import { ROLES_METADATA_KEY } from '../constants';

export const Roles = (roles: string | string[]) => {
  const rs = Array.isArray(roles) ? roles : [roles];
  return SetMetadata(ROLES_METADATA_KEY, rs);
};
