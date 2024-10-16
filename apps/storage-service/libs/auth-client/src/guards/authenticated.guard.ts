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
    const headers = request.headers;
    const userId = headers['x-user-id'];
    const anonymous = headers['x-anonymous'];
    const roles = headers['x-user-roles'];
    const permissions = headers['x-user-permissions'];
    const userMetadata = headers['x-user-metadata'];

    if (required && !userId) return false;

    request.auth = {
      required,
      userId,
      id: userId,
      anonymous,
      roles: roles && JSON.parse(roles),
      permissions: permissions && JSON.parse(permissions),
      metadata: userMetadata && JSON.parse(userMetadata),
    };
    return true;
  }
}
