import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IdentityService } from 'src/app/services';

import { AuthRequired } from '../decorators';

@Injectable()
export class AuthGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly indentifyService: IdentityService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const isRpc = context.getType() === 'rpc';
    if (isRpc) return true;

    const isRequired =
      this.reflector.getAllAndOverride<boolean>(AuthRequired, [
        context.getHandler(),
        context.getClass(),
      ]) ?? true;

    let token: string = request.headers['authorization'];

    if (!token && !isRequired) return true;
    if (!token) throw new UnauthorizedException('access_token_is_required');

    token = token.replace('Bearer ', '');
    const user = await this.indentifyService.validateToken(token);
    if (!user) throw new UnauthorizedException('invalid_access_token');

    request.user = user;
    return true;
  }
}
