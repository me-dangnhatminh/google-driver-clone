import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_METADATA_KEY } from '../constants';

export class AllowedRoles implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const roles = this.reflector.getAllAndOverride<string[]>(
      ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles) return true;
    const userRoles = request.auth?.roles ?? [];
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (hasRole) return true;
    throw new ForbiddenException('Insufficient roles');
  }
}
