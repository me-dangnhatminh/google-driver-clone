import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE_KEY } from 'src/common/constants';

export const Public = (): CustomDecorator<string> =>
  SetMetadata(PUBLIC_ROUTE_KEY, true);
