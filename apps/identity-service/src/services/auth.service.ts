import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { UserInfoClient, ResponseError } from 'auth0';
import { Cache } from 'cache-manager';

export const userInfo = new UserInfoClient({
  domain: 'dangnhatminh.us.auth0.com',
});

@Injectable()
export class AuthService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async validateToken(accessToken: string) {
    const cacheKey = `auth0:${accessToken}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    return await userInfo
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
