import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as rx from 'rxjs';

@Injectable()
export class Authenticated implements CanActivate {
  constructor(@Inject('AuthService') private readonly authService: any) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    let token = request.headers.authorization;
    if (!token) return false;
    token = token.replace('Bearer ', '');
    return rx.from(this.authService.verifyToken({ token })).pipe(
      rx.map((user: any) => {
        user['sub'] = user.id;
        request.auth = { user };
        return true;
      }),
      rx.catchError((err) => {
        const msg = err.details;
        let msgJson = { code: err.code, message: msg };
        try {
          msgJson = JSON.parse(msg);
        } catch (e) {}

        if (msgJson.code === 'invalid_token')
          throw new UnauthorizedException(msgJson.message);
        throw err;
      }),
    );
  }
}
