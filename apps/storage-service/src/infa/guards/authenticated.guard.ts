import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';
import * as rx from 'rxjs';

@Injectable()
export class Authenticated implements CanActivate {
  private readonly authService: any;
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly client: ClientGrpcProxy,
  ) {
    this.authService = this.client.getService('AuthService');
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (!token) return false;
    const metadata = new grpc.Metadata();
    metadata.add('authorization', token);
    const verify = this.authService.verifyToken({}, metadata);
    return rx.from(verify).pipe(
      rx.catchError((err) => {
        console.log(err);
        // throw new UnauthorizedException(err);
        throw new Error(err);
      }),
      rx.map((user: any) => {
        console.log(user);
        user['sub'] = user.id; // TODO: fix
        request.user = user;
        return true;
      }),
    );
  }
}
