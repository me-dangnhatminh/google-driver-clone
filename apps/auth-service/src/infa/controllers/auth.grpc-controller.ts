import {
  Controller,
  Injectable,
  Logger,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { ResponseError, UserInfoClient } from '../adapters/auth0.module';
import { UnauthenticatedRpcException, UnknownRpcException } from 'libs/common';
import { ErrorType } from 'src/common';
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
        const duration = Date.now() - start;
        this.logger.log(`Time: ${duration}ms`);
      }),
      rx.catchError((err) => {
        const duration = Date.now() - start;
        this.logger.error(
          `Time: ${duration}ms, Error: ${err.message}`,
          err.stack,
        );
        throw err;
      }),
    );
  }
}

@Injectable()
export class VerifyTokenCached implements NestInterceptor {
  constructor(private readonly cache: Cache) {}

  intercept(context, next) {
    const methodName = context.getHandler().name;
    if (methodName !== 'verifyToken') return next.handle();

    const [req] = context.getArgs();
    const token = req.token;
    return rx.from(this.cache.get(token)).pipe(
      rx.mergeMap((cached: any) => {
        if (cached && cached.value) return rx.of(cached);
        if (cached && cached.error) {
          const error = cached.error;
          return rx.throwError(new RpcException(error));
        }

        return next.handle().pipe(
          rx.map(async (data) => {
            await this.cache.set(token, { value: data }, 60 * 60 * 1000); // 1 hour
            return data;
          }),
          rx.catchError(async (err) => {
            await this.cache.set(token, { error: err }, 60 * 1000); // 1 minute
            throw err;
          }),
        );
      }),
    );
  }
}

@Controller()
@UseInterceptors(LoggingInterceptor, VerifyTokenCached)
export class AuthGrpcController {
  constructor(
    private readonly userInfo: UserInfoClient,
    private readonly cache: Cache,
  ) {}

  @GrpcMethod('AuthService', 'verifyToken')
  verifyToken(request) {
    const fetch = this.userInfo
      .getUserInfo(request.token)
      .then((res) => res.data)
      .then((data) => ({
        id: data.sub,
        email: data.email,
        name: data.name,
        roles: ['user'],
        permissions: data.permissions || [],
      }))
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
      });

    return rx.from(fetch);
  }
}
