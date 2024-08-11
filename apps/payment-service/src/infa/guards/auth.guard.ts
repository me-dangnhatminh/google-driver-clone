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
    const request: Request = context.switchToHttp().getRequest();
    const isRpc = context.getType() === 'rpc';
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic || isRpc) {
      return true;
    }
    let token: string = request.headers.authorization;
    console.log('token', request.headers);
    if (!token) {
      throw new UnauthorizedException('AccessTokenInvalid');
    }
    token = token.replace('Bearer ', '');
    const response = await this.indentifyService.validateToken(token);
    if (!response) {
      throw new UnauthorizedException('auth.accessTokenUnauthorized');
    }
    request['user'] = response;
    return true;
  }
}
