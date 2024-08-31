import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { Request } from 'express';

@Controller('identity')
@ApiTags('root')
export class RootController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
  ) {}

  @Get('health')
  getHealth() {
    return this.health.check([
      () => this.http.pingCheck('google', 'https://google.com'),
    ]);
  }

  @Get('me')
  getHello(@Req() req: Request) {
    if (!req.oidc.isAuthenticated()) {
      return { message: 'Hello World!, Please login' };
    }
    if (req.oidc.user) {
      return {
        user: req.oidc.user,
        access_token: req.oidc.accessToken.access_token,
      };
    }
  }
}
