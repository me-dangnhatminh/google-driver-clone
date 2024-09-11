import { Metadata } from '@grpc/grpc-js';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserInfoClient } from 'auth0';

@Controller()
export class AuthGrpcController {
  constructor(
    private readonly userInfo: UserInfoClient,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @GrpcMethod('AuthService', 'verifyToken')
  async verifyToken(_request, metadata: Metadata) {
    const token = String(metadata.get('authorization')).replace('Bearer ', '');

    const cachedUser = await this.cacheManager.get(token);
    if (cachedUser) return cachedUser;
    const user = await this.userInfo
      .getUserInfo(token)
      .then((res) => res.data)
      .then((data) => ({
        id: data.sub,
        email: data.email,
        name: data.name,
        roles: ['user'],
      }));
    await this.cacheManager.set(token, user, 24 * 60 * 60 * 1000); // 24 hours
    return user;
  }
}
