import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { UserInfoClient, ResponseError } from 'auth0';
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

  create(dto: UserCreateDTO): Promise<UserDTO> {
    throw new Error('Method not implemented.' + dto);
  }

  getById(id: string): Promise<UserDTO> {
    throw new Error('Method not implemented.' + id);
  }

  list(): Observable<UserDTO[]> {
    throw new Error('Method not implemented.');
  }

  async validateToken(accessToken: string) {
    const cacheKey = `auth0:${accessToken}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    return await this.userInfo
      .getUserInfo(accessToken)
      .then((res) => ({
        sub: res.data.sub,
        user_id: res.data.sub,
        email: res.data.email,
        name: res.data.name,
        picture: res.data.picture,
      }))
      .catch((err) => {
        if (err instanceof ResponseError) {
          const msg = err.headers.get('WWW-Authenticate');
          console.error(`Auth0 error: ${msg}`);
          if (err.statusCode === 401) return null;
        }
        throw err;
      })
      .then((data) => {
        this.cache.set(cacheKey, data, 3600); // 1 hour
        return data;
      });
  }
}
