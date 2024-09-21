import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PERMISSIONS_METADATA_KEY } from '../constants';

@Injectable()
export class AllowedPermission implements CanActivate {
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
    throw new ForbiddenException('Insufficient permissions');
  }
}
