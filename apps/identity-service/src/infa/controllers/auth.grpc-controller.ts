import { Metadata } from '@grpc/grpc-js';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Controller, Inject, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { UserInfoClient } from 'auth0';
import { GrpcUnauthenticatedException } from 'lib/common';

@Controller()
export class AuthGrpcController {
  private readonly logger = new Logger(AuthGrpcController.name);
  constructor(
    private readonly userInfo: UserInfoClient,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @GrpcMethod('AuthService', 'verifyToken')
  async verifyToken(_request, metadata: Metadata) {
    const token = String(metadata.get('authorization')).replace('Bearer ', '');
    const cachedUser = await this.cacheManager.get(token);
    if (cachedUser === 'invalid_token') {
      throw new GrpcUnauthenticatedException('invalid_token');
    }

    if (cachedUser) return cachedUser;
    const user = await this.userInfo
      .getUserInfo(token)
      .then((res) => res.data)
      .then((data) => ({
        id: data.sub,
        email: data.email,
        name: data.name,
        roles: ['user'],
      }))
      .catch(async (err) => {
        console.error(err);
        await this.cacheManager
          .set(token, 'invalid_token', 1 * 60 * 1000)
          .catch(() => this.logger.warn('Failed to cache invalid token'));

        throw new RpcException({
          code: 'invalid_token',
          message: 'invalid token',
        });
      });

    await this.cacheManager.set(token, user, 24 * 60 * 60 * 1000); // 24 hours
    return user;
  }
}
