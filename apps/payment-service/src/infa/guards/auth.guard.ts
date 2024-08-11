import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { Reflector } from '@nestjs/core';
import { IdentityService } from 'src/services';

const PUBLIC_ROUTE_KEY = 'public'; // TODO: import from common constants

@Injectable()
export class AuthGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly indentifyService: IdentityService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isRpc = context.getType() === 'rpc';
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic || isRpc) {
      return true;
    }
    let token: string = request.headers['authorization'];
    if (!token) {
      throw new UnauthorizedException('access_token_is_required');
    }
    token = token.replace('Bearer ', '');
    const user = await this.indentifyService.validateToken(token);
    if (!user) {
      throw new UnauthorizedException('invalid_access_token');
    }
    request.user = user;
    return true;
  }
}
