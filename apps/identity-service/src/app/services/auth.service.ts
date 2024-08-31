import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { UserInfoClient } from 'auth0';
import { Cache } from 'cache-manager';
import { Observable } from 'rxjs';
import {
  IAuthService,
  UserCreateDTO,
  UserDTO,
} from 'src/contracts/auth-service.abstract';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly userInfo: UserInfoClient,
  ) {}

  async create(dto: UserCreateDTO): Promise<UserDTO> {
    return { id: 'fake-id', email: dto.email, roles: dto.roles || ['user'] };
  }

  async getById(id: string): Promise<UserDTO> {
    return { id: id, email: 'fake@mail', roles: ['user'] };
  }

  list(
    filter?: Partial<UserDTO>,
    limit?: number,
    offset?: number,
  ): Observable<UserDTO[]> {
    console.log('list', filter, limit, offset);
    const subject = new Observable<UserDTO[]>();
    return subject;
  }
}
