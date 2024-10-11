import {
  Controller,
  Get,
  Inject,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ConfigService } from 'src/config';

import { CacheKey, CacheTTL } from '../adapters';
import {
  BearerTokenCacheInterceptor,
  AuthResponseInterceptor,
} from '../interceptors';

@Controller({ path: 'auth', version: '1' })
@ApiTags('auth')
@ApiBearerAuth()
export class AuthRestController {
  constructor(
    private readonly configService: ConfigService,
    @Inject('AuthService') private readonly authService,
  ) {}

  @Get('validate')
  @CacheKey('auth')
  @CacheTTL(60 * 60 * 1000)
  @UseInterceptors(AuthResponseInterceptor, BearerTokenCacheInterceptor)
  async validate(@Req() req: Request) {
    const headerName = this.configService.infer('auth.headers');
    const strictConfig = this.configService.infer('auth.strict');

    const strictHeader = req.headers[headerName.strict];
    const strictMode =
      strictHeader == undefined
        ? strictConfig
        : strictHeader == 'true'
          ? true
          : false;

    const authHeader = req.headers.authorization;

    const token = authHeader?.split('Bearer ')[1];

    if (!token && strictMode) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const user = await this.authService
      .verifyToken({ token })
      .toPromise()
      .catch(() => {
        throw new UnauthorizedException('Invalid token');
      });

    return user;
  }
}
