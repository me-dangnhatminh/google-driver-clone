import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { PERMISSIONS_METADATA_KEY } from '../constants';

@Injectable()
export class AllowedPermission implements CanActivate {
  private readonly logger = new Logger(AllowedPermission.name);
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const required: string[] =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_METADATA_KEY, [
        context.getClass(),
        context.getHandler(),
      ]) ?? [];
    const userHas: string[] = req?.auth?.permissions ?? [];
    const has = required.every((p) => userHas.includes(p));
    if (has) return true;
    const msg = `Insufficient permissions: ${required.join(', ')} required, but user has ${userHas.join(', ')}`;
    this.logger.warn(msg);
    throw new ForbiddenException('Insufficient permissions');
  }
}
