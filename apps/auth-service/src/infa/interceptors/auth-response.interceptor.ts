import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { map } from 'rxjs';
import { ConfigService } from 'src/config';

@Injectable()
export class AuthResponseInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((user) => {
        const response = context.switchToHttp().getResponse<Response>();
        const headerName = this.configService.infer('auth.headers');
        response.setHeader(headerName.anonymous, 'true');
        response.setHeader(headerName.userId, user.id);
        response.setHeader(headerName.anonymous, 'false');
        response.setHeader(headerName.roles, JSON.stringify(user.roles));
        response.setHeader(
          headerName.permissions,
          JSON.stringify(user.permissions),
        );
        response.setHeader(
          headerName.userMetadata,
          JSON.stringify(user.metadata),
        );

        return user;
      }),
    );
  }
}

export default AuthResponseInterceptor;
