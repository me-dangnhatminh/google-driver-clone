import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { randomUUID as uuid } from 'crypto';

import { UnauthenticatedRpcException, UnknownRpcException } from '@app/common';

import {
  AuthService,
  ManagementClient,
  ResponseError,
  UserInfoClient,
  wwwAuthToJson,
} from '../adapters/auth0.module';
import {
  IdempotencyInterceptor,
  IdempotencyTTL,
} from '../adapters/idempotency';

import { ErrorType } from 'src/common';
import Redis from 'ioredis';
import { Metadata } from '@grpc/grpc-js';

const SERVICE_NAME = 'AuthService';
@Controller()
export class AuthGrpcController {
  constructor(
    private readonly userInfo: UserInfoClient,
    private readonly manager: ManagementClient,
    private readonly authService: AuthService,
    @Inject('IDEMPOTENT_SERVICE') private readonly idempotentService: Redis,
  ) {}
  
  @GrpcMethod(SERVICE_NAME, 'ping')
  ping() {
    return { message: 'pong' };
  }

  @GrpcMethod(SERVICE_NAME, 'verify')
  @IdempotencyTTL(5000)
  @UseInterceptors(IdempotencyInterceptor)
  async verifyToken(request, metadata: Metadata) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const value = { sub: uuid() };

    const idempotencyKey = metadata.get('idempotency-key')[0] ?? null
    const idempotencyTtl = metadata.get('idempotency-ttl')[0]?? null
    if (!idempotencyKey) return value;

    await this.idempotentService.set(
      request.idempotencyKey,
      JSON.stringify(value),
      'PX',
      Number(idempotencyTtl ?? 24 * 60 * 60 * 1000),
      "NE"
    ).then(isSet => {
      if(isSet !== 'OK') throw new Error(`Duplicate Error: key "${idempotencyKey}"`)
    })
    return value;
  }


  @GrpcMethod(SERVICE_NAME, 'validate')
  validate(request) {
    return this.userInfo
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
  }
}
