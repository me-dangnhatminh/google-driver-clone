import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

@Controller({ path: 'health', version: VERSION_NEUTRAL })
@ApiTags('_health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiBearerAuth()
  checks() {
    return this.health.check([
      () =>
        this.db.pingCheck('database', {
          $queryRawUnsafe: (query) => query,
          $runCommandRaw: (command) => command,
        }),
    ]);
  }
}
