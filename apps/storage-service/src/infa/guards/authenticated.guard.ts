import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class Authenticated implements CanActivate {
  constructor(
    @Inject('STORAGE_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (!token) return false;

    const user = {};
    if (!user) return false;

    request.user = user;
    return true;
  }
}
