import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import {
  ManagementClient,
  ResponseError,
  UserInfoClient,
  wwwAuthToJson,
} from '../adapters/auth0.module';
import { UnauthenticatedRpcException, UnknownRpcException } from 'libs/common';
import { ErrorType } from 'src/common';
import { Cache } from '../adapters';
import * as rx from 'rxjs';

@Controller()
export class AuthGrpcController {
  constructor(
    private readonly userInfo: UserInfoClient,
    private readonly manager: ManagementClient,
    private readonly cache: Cache,
  ) {}

  @GrpcMethod('AuthService', 'verifyToken')
  async verifyToken(request) {
    await this.cache.del(request.token);
    const cached: any = await this.cache.get(request.token).catch(() => null);
    if (cached && cached.value) return rx.of(cached.value);
    if (cached && cached.error) throw new RpcException(cached.error);

    const get = this.userInfo
      .getUserInfo(request.token)
      .then((res) => res.data)
      .then(({ sub, email, email_verified, name, permissions, auth, pay }) => {
        // TODO: not good to have this here
        return {
          id: sub,
          email,
          name,
          permissions,
          email_verified,
          metadata: Object.assign({}, auth, pay),
        };
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
      });

    // == cache the result
    return await rx.from(get).pipe(
      rx.map(async (value) => {
        await this.cache
          .set(request.token, { value }, 60 * 60 * 1000) // 1 hour
          .catch(() => null);
        return value;
      }),
      rx.catchError(async (error) => {
        await this.cache
          .set(request.token, { error }, 60 * 60 * 1000) // 1 hour
          .catch(() => null);
        throw error;
      }),
    );
  }
}
