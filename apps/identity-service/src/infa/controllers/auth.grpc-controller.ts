import { Metadata } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserInfoClient } from 'auth0';

@Controller()
export class AuthGrpcController {
  constructor(private readonly userInfo: UserInfoClient) {}

  @GrpcMethod('AuthService', 'verifyToken')
  async verifyToken(_request, metadata: Metadata) {
    const token = String(metadata.get('authorization')).replace('Bearer ', '');
    const user = await this.userInfo.getUserInfo(token).then((res) => res.data);
    return {
      id: user.sub,
      email: user.email,
      name: user.name,
      roles: ['user'],
    };
  }
}
