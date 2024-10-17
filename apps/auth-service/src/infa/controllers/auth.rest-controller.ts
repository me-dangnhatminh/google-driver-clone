import {
  Controller,
  Get,
  Headers,
  Inject,
  Query,
  Res,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { CacheKey, CacheTTL } from '../adapters';
import {
  BearerTokenCacheInterceptor,
  AuthResponseInterceptor,
} from '../interceptors';

import Redis from 'ioredis';

@Controller({ path: 'auth', version: '1' })
@ApiTags('auth')
@ApiBearerAuth()
export class AuthRestController {
  constructor(
    @Inject('AuthService') private readonly authService,
    @Inject('IDEMPOTENT_SERVICE') private readonly idempotentService: Redis,
  ) {}

  @Get('validate')
  @UseInterceptors(AuthResponseInterceptor, BearerTokenCacheInterceptor)
  @CacheKey('auth:validate')
  @CacheTTL(60 * 60 * 1000) // 1 hour
  @ApiHeaders([
    {
      name: 'authorization',
      required: false,
      description: 'Bearer',
    },
    {
      name: 'x-auth-strict',
      required: false,
      description: 'true',
    },
  ])
  async validate(
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') authorization?: string,
    @Headers('x-auth-strict') strict?: string,
  ) {
    try {
      if (!authorization && strict === 'true') {
        const message = `Missing 'Authorization' header`;
        throw new UnauthorizedException({ type: 'invalid_request', message });
      }

      if (!authorization) {
        const message = `Missing 'Authorization' header`;
        throw new UnauthorizedException({ type: 'invalid_request', message });
      }

      const [type, token] = authorization.split(' ');

      if (type !== 'Bearer') {
        const message = 'Invalid token type';
        throw new UnauthorizedException({ type: 'invalid_request', message });
      }

      // handle 'Bearer' token
      if (!token) {
        const message = 'Missing token';
        throw new UnauthorizedException({ type: 'invalid_request', message });
      }

      const user = await this.authService
        .validate({ token })
        .toPromise()
        .catch((err) => {
          const message = err.message;
          throw new UnauthorizedException({ type: 'unknown', message });
        });
      return user;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        const errRes = err.getResponse();
        const msg = errRes['message'] ? errRes['message'] : 'Unauthorized';
        res.setHeader('Access-Control-Expose-Headers', 'WWW-Authenticate');
        res.setHeader(
          'WWW-Authenticate',
          `Bearer realm="auth", error_description="${msg}"`,
        );
      }
      throw err;
    }
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    return await this.authService.verify({ token }).toPromise();
  }
}
