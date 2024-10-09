import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_REQUIRED_METADATA_KEY } from '../constants';

@Injectable()
export class Authenticated implements CanActivate {
  constructor(
    @Inject('AuthService') private readonly authService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext) {
    if (context.getType() !== 'http') return true;

    const required = this.reflector.getAllAndOverride<boolean>(
      AUTH_REQUIRED_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const anonymous = request.headers['x-anonymous'];
    const roles = request.headers['x-user-roles'];
    const permissions = request.headers['x-user-permissions'];
    if (required && !userId) return false;

    request.auth = {
      required,
      userId,
      anonymous,
      roles: roles && JSON.parse(roles),
      permissions: permissions && JSON.parse(permissions),
    };
    return true;
  }
}
