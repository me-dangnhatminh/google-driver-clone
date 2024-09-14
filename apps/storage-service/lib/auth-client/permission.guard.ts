import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Permissions = (permissions: string | string[]) => {
  return Reflect.metadata(
    'permissions',
    Array.isArray(permissions) ? permissions : [permissions],
  );
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const requiredPermissions: string[] =
      this.reflector.getAllAndOverride('permissions', [
        context.getClass(),
        context.getHandler(),
      ]) || [];
    const userPermissions: string[] = req?.auth?.permissions || [];
    const has = requiredPermissions.every((p) => userPermissions.includes(p));
    if (!requiredPermissions.length || has) return true;
    throw new ForbiddenException('Insufficient permissions');
  }
}
