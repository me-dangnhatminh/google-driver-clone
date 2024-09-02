import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ManagementClient } from 'auth0';
import * as rx from 'rxjs';

@Controller()
export class UserGrpcController {
  constructor(private readonly userManagement: ManagementClient) {}

  @GrpcMethod('UserService', 'list')
  list(messages: any) {
    const fetch = this.userManagement.users.getAll({
      fields: 'user_id,name,email',
    });
    return rx.from(fetch).pipe(
      rx.map((u) => u.data),
      rx.map((u) =>
        u.map((user) => ({
          id: user.user_id,
          name: user.name,
          email: user.email,
          roles: ['user'],
        })),
      ),
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
}
