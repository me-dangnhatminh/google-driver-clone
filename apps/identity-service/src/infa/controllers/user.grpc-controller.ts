import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';

@Controller()
export class UserGrpcController {
  @GrpcMethod('IUserService', 'create')
  create(@Payload() data: { email: string; password: string }) {
    console.log('create', data);
  }

  @GrpcMethod('IUserService', 'list')
  list() {
    console.log('list');
  }
}
