import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ManagementClient } from 'auth0';
import * as rx from 'rxjs';

@Controller()
export class UserGrpcController {
  constructor(private readonly userManagement: ManagementClient) {}

  @GrpcMethod('UserService', 'list')
  list() {
    const fetch = this.userManagement.users.getAll({});
    return rx.from(fetch).pipe(
      rx.map((res) => res.data),
      rx.map((users) =>
        users.map((u) => ({
          id: u.user_id,
          name: u.name,
          email: u.email,
          roles: ['user'],
        })),
      ),
      rx.map((users) => ({
        users,
        cursor: null,
        limit: 10,
        total: users.length,
      })),
    );
  }

  @GrpcMethod('UserService', 'getById')
  getById(messages: any) {
    const fetch = this.userManagement.users.get({ id: messages.id });
    return rx.from(fetch).pipe(
      rx.map((u) => u.data),
      rx.map((user) => ({
        id: user.user_id,
        name: user.name,
        email: user.email,
        roles: ['user'],
      })),
    );
  }

  @GrpcMethod('UserService', 'create')
  create(messages: any) {
    return rx.of(messages);
  }
}
