import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { Request } from 'express';

@Controller({ path: 'health' })
@ApiTags('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiBearerAuth()
  checks(@Req() request: Request) {
    console.log(request.headers);
    return this.health.check([
      () => this.http.pingCheck('google', 'https://google.com'),
      () => this.http.pingCheck('nestjs', 'https://nestjs.com'),
    ]);
  }
}
