import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import {
  AuthService,
  ManagementClient,
  ResponseError,
  UserInfoClient,
  wwwAuthToJson,
} from '../adapters/auth0.module';
import { UnauthenticatedRpcException, UnknownRpcException } from '@app/common';
import { ErrorType } from 'src/common';

const SERVICE_NAME = 'AuthService';

@Controller()
export class AuthGrpcController {
  constructor(
    private readonly userInfo: UserInfoClient,
    private readonly manager: ManagementClient,
    private readonly authService: AuthService,
  ) {}

  @GrpcMethod(SERVICE_NAME, 'verify')
  async verifyToken(request) {
    return await this.authService.verifyToken(request.token);
  }

  @GrpcMethod(SERVICE_NAME, 'ping')
  ping() {
    return { message: 'pong' };
  }

  @GrpcMethod(SERVICE_NAME, 'validate')
  validate(request) {
    const get = this.userInfo
      .getUserInfo(request.token)
      .then((res) => {
        console.log(res);
        return res.data;
      })
      .then(({ sub, email, email_verified, name, permissions, auth, pay }) => {
        const _auth = auth as any;
        return {
          id: sub,
          email,
          name,
          permissions,
          email_verified,
          metadata: Object.assign({}, auth, pay),
          ..._auth,
        };
      })
      .catch((err: ResponseError) => {
        console.error(err);
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

    return get;
  }
}
