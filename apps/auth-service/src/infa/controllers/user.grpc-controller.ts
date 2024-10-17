import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ManagementClient } from 'auth0';
import * as rx from 'rxjs';

const SERVICE_NAME = 'UserService';

@Controller()
export class UserGrpcController {
  constructor(private readonly userManagement: ManagementClient) {}

  @GrpcMethod(SERVICE_NAME, 'ping')
  ping() {
    return { message: 'pong' };
  }

  @GrpcMethod(SERVICE_NAME, 'get')
  async get(request) {
    const id = request.id;
    return await Promise.all([
      this.userManagement.users
        .getRoles({ id })
        .then((rs) => rs.data)
        .then((rs) => rs.map((r) => r.name)),
      this.userManagement.users
        .getPermissions({ id })
        .then((rs) => rs.data)
        .then((rs) => rs.map((r) => r.permission_name)),
      this.userManagement.users.get({ id }).then((rs) => {
        const data = rs.data;
        return {
          id: data.user_id,
          name: data.name,
          email: data.email,
          metadata: data.app_metadata,
        };
      }),
    ]).then(([roles, permissions, user]) => {
      return { ...user, roles, permissions };
    });
  }

  @GrpcMethod(SERVICE_NAME, 'list')
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

  @GrpcMethod(SERVICE_NAME, 'getById')
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

  @GrpcMethod(SERVICE_NAME, 'create')
  create() {
    throw new Error('Not implemented');
  }

  @GrpcMethod(SERVICE_NAME, 'update')
  async update(request: any) {
    try {
      return await this.userManagement.users.update(
        { id: request.id },
        { app_metadata: app_metadata },
      );
    } catch (error) {
      console.error(error);
      throw new Error('User not found');
    }
  }
}
