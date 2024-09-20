import {
  Controller,
  Injectable,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { ResponseError, UserInfoClient } from '../adapters/auth0.module';
import { UnauthenticatedRpcException, UnknownRpcException } from 'lib/common';
import { AppError, AuthErrorCode, ErrorType } from 'src/common';
import { Cache } from '../adapters';
import * as rx from 'rxjs';

const wwwAuthToJson = (wwwAuth: string): Record<string, string> => {
  wwwAuth = wwwAuth.replace('Bearer ', '');
  return wwwAuth
    .split(',')
    .map((w) => w.trim())
    .reduce((acc, curr) => {
      const [key, value] = curr.split('=');
      acc[key] = value.replace(/"/g, '');
      return acc;
    }, {});
};

@Injectable()
export class LoggingInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  constructor() {}

  intercept(context, next) {
    const start = Date.now();
    return next.handle().pipe(
      rx.tap(() => {
        const now = Date.now();
        this.logger.log(`Time: ${now - start}ms`);
      }),
      rx.catchError((err) => {
        this.logger.error(err, err.stack);
        throw err;
      }),
    );
  }
}

const mapTo = {
  [AuthErrorCode.unknown]: UnknownRpcException,
  [AuthErrorCode.invalid_token]: UnauthenticatedRpcException,
};

@Controller()
@UseInterceptors(LoggingInterceptor)
export class AuthGrpcController {
  constructor(
    private readonly userInfo: UserInfoClient,
    private readonly cache: Cache,
  ) {}

  @GrpcMethod('AuthService', 'verifyToken')
  async verifyToken(request) {
    const token = request.token;
    const cached: any = await this.cache.get(token);
    if (cached && cached.value) return cached;
    if (cached && cached.error) {
      const ErrorClass = mapTo[cached.error.code] || UnknownRpcException;
      throw new ErrorClass(cached.error);
    }

    return this.userInfo
      .getUserInfo(token)
      .then((res) => res.data)
      .then((data) => ({
        id: data.sub,
        email: data.email,
        name: data.name,
        roles: ['user'],
        permissions: data.permissions || [],
      }))
      .then(async (user) => {
        await this.cache.set(token, { value: user }, 24 * 60 * 60 * 1000);
        return user;
      })
      .catch((err: ResponseError) => {
        const status = err.statusCode;
        if (status === 401) {
          const headers = err.headers;
          const wwwAuth = headers.get('www-authenticate');
          if (!wwwAuth) throw new Error('www-authenticate header not found');

          const detail = wwwAuthToJson(wwwAuth);
          throw new UnauthenticatedRpcException({
            type: 'unauthorized',
            code: 'invalid_token',
            message: detail.error_description,
          });
        }

        throw new UnknownRpcException({
          type: ErrorType.unknown,
          code: 'unknown',
          message: err.message,
        });
      })
      .catch(async (err) => {
        await this.cache.set(token, { error: err }, 60 * 60 * 1000); // 1 hour
        throw err;
      });
  }
}
