import { Metadata } from '@grpc/grpc-js';
import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ManagementClient } from 'auth0';
import Redis from 'ioredis';
import * as rx from 'rxjs';
import { IdempotencyInterceptor } from '../adapters';

const SERVICE_NAME = 'UserService';

@Controller()
export class UserGrpcController {
  constructor(
    private readonly userManagement: ManagementClient,
    @Inject('IDEMPOTENT_SERVICE') private readonly idempotentService: Redis,
  ) {}

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
  @UseInterceptors(IdempotencyInterceptor)
  getById(request) {
    const fetch = this.userManagement.users.get({ id: request.id });
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
  // @UseInterceptors(IdempotencyInterceptor)
  async update(request, metadata) {
    try {
      const user_metadata = { 'my-storage': request.metadata['my-storage'] };

      const value = await await this.userManagement.users.update(
        { id: request.id },
        { user_metadata },
      );
      return value;
      // return await this.handleIdempotency(value, metadata);
    } catch (error) {
      console.error(error);
      throw new Error('User not found');
    }
  }

  private async handleIdempotency<T>(value: T, metadata: Metadata): Promise<T> {
    //TODO: move to interceptor (error)
    const idempotencyKey = metadata.get('idempotency-key')[0] ?? null;
    const idempotencyTtl = metadata.get('idempotency-ttl')[0] ?? null;
    if (!idempotencyKey) return value;
    const ok = await this.idempotentService.set(
      String(idempotencyKey),
      JSON.stringify(value),
      'PX',
      Number(idempotencyTtl ?? 24 * 60 * 60 * 1000),
      'NX',
    );
    if (ok !== 'OK') {
      throw new RpcException(`Duplicate request with key: ${idempotencyKey}`);
    }
    return value;
  }
}
