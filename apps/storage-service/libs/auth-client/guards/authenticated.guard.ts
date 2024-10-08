import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class Authenticated implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const anonymous = request.headers['x-anonymous'] === 'true';
    const auth = { userId, anonymous };
    request.auth = auth;
    return true;
  }
}
