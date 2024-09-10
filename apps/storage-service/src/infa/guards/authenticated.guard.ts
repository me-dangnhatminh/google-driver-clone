import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';

@Injectable()
export class Authenticated implements CanActivate {
  private readonly authService: any;
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly client: ClientGrpcProxy,
  ) {
    this.authService = this.client.getService('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (!token) return false;
    const metadata = new grpc.Metadata();
    metadata.add('authorization', token);
    const user = await this.authService.verifyToken({}, metadata).toPromise();
    user['sub'] = user.id; // TODO: fix
    request.user = user;
    return true;
  }
}
