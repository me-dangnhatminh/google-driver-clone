import { GrpcMethod, Payload } from '@nestjs/microservices';

export class UserController {
  @GrpcMethod('IUserService', 'create')
  create(@Payload() data: { email: string; password: string }) {
    console.log('create', data);
  }

  @GrpcMethod('IUserService', 'list')
  list() {
    console.log('list');
  }
}
