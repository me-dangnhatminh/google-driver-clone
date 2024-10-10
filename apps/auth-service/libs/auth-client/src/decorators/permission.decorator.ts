import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_METADATA_KEY } from '../constants';

export const Permissions = (permissions: string | string[]) => {
  const pers = Array.isArray(permissions) ? permissions : [permissions];
  return SetMetadata(PERMISSIONS_METADATA_KEY, pers);
};
