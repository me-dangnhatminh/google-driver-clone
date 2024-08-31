import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { AuthService } from 'src/app';

@Controller()
export class UserGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('IUserService', 'getById')
  getById(@Payload() data: { id: string }) {
    return this.authService.getById(data.id);
  }

  @GrpcMethod('IUserService', 'create')
  create(@Payload() data: { email: string; password: string }) {
    return this.authService.create({
      email: data.email,
      password: data.password,
    });
  }
}
