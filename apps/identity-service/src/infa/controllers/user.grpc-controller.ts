import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ManagementClient } from 'auth0';
import * as rx from 'rxjs';

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
  constructor(private readonly userManagement: ManagementClient) {}

  @GrpcMethod('UserService', 'list')
  list() {
    const fetch = this.userManagement.users.getAll({});
    const users = rx.from(fetch).pipe(
      rx.map((u) => u.data),
      rx.map((u) =>
        u.map((user) => ({
          id: user.user_id,
          name: user.name,
          email: user.email,
          roles: ['user'],
        })),
      ),
    );

    return users.pipe(
      rx.map((u) => ({
        users: u,
        cursor: null,
        limit: 10,
        total: u.length,
      })),
    );
  }

  @GrpcMethod('UserService', 'getById')
  getById(messages: any) {
    const id = messages.id;
    const finded = userRepo.find((u) => u.id === id);
    return rx.of(finded);
  }
}
