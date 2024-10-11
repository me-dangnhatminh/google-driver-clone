import { Controller, Get, Inject, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  GRPCHealthIndicator,
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

const ServingStatus = {
  UNKNOWN: 0,
  SERVING: 1,
  NOT_SERVING: 2,
  SERVICE_UNKNOWN: 3,
};

@Controller({ path: 'health', version: VERSION_NEUTRAL })
@ApiTags('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private grpc: GRPCHealthIndicator,
    @Inject('AuthService') private authService,
    @Inject('UserService') private userService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiBearerAuth()
  checks() {
    return this.health.check([
      () =>
        this.prisma.pingCheck('database', {
          $queryRawUnsafe: (query) => query,
          $runCommandRaw: (command) => command,
        }),
      () => {
        return this.grpc.checkService('UserService', 'AuthService', {
          // TODO: bad solution, need to refactor
          healthServiceCheck: (_, service) => {
            const camelCaseService =
              service.charAt(0).toLowerCase() + service.slice(1);
            return this[camelCaseService]
              .ping({})
              .toPromise()
              .then(() => ({ status: ServingStatus.SERVING }))
              .catch(() => ({ status: ServingStatus.NOT_SERVING }));
          },
        });
      },
      () => {
        return this.grpc.checkService('UserService', 'UserService', {
          healthServiceCheck: (_, service) => {
            // TODO: bad solution, need to refactor
            const camelCaseService =
              service.charAt(0).toLowerCase() + service.slice(1);
            return this[camelCaseService]
              .ping({})
              .toPromise()
              .then(() => ({ status: ServingStatus.SERVING }))
              .catch(() => ({ status: ServingStatus.NOT_SERVING }));
          },
        });
      },
    ]);
  }
}
