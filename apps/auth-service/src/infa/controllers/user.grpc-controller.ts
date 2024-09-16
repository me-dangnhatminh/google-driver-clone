import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ManagementClient } from 'auth0';
import * as rx from 'rxjs';

@Controller()
export class UserGrpcController {
  constructor(private readonly userManagement: ManagementClient) {}

  @GrpcMethod('UserService', 'list')
  list(request: any) {
    const subject = new rx.Subject();

    const limit = request.limit || 10;
    let page = 0;
    let loadedLength = 0;

    const get = async () => {
      const {
        data: { users, total },
      } = await this.userManagement.users.getAll({
        include_totals: true,
        page: page++,
      });

      subject.next({
        users: users.map((u) => ({
          id: u.user_id,
          name: u.name,
          email: u.email,
          roles: ['user'],
        })),
        total,
        limit,
      });

      loadedLength += users.length;
      if (loadedLength === total) subject.complete();
      else get();
    };

    get();

    return rx.from(subject);
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
