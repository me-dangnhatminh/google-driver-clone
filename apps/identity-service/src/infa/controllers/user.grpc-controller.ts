import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import * as rx from 'rxjs';

import { AuthService } from 'src/app';
import { UserDTO } from 'src/contracts';

const userRepo: UserDTO[] = [
  {
    id: '1',
    name: 'name1',
    email: 'email1',
    roles: ['admin'],
  },

  {
    id: '2',
    name: 'name2',
    email: 'email2',
    roles: ['user'],
  },
];

@Controller()
export class UserGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcStreamMethod('IUserService', 'list')
  list() {
    return rx.of(userRepo);
  }

  @GrpcMethod('IUserService', 'getById')
  getById(data: any) {
    return userRepo.find((u) => u.id === data.id);
  }
}
