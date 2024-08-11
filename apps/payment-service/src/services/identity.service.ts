import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ResponseError, UserInfoClient } from 'auth0';

const userInfo = new UserInfoClient({
  domain: 'dangnhatminh.us.auth0.com',
});

export class UserDTO {
  sub: string;
  user_id: string;
  email: string;
  name: string;
  picture: string;
}

@Injectable()
export class IdentityService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  async validateToken(accessToken: string): Promise<UserDTO | null> {
    // const cacheKey = `auth0:${accessToken}`;

    // const cached = await this.cache.get<UserDTO>(cacheKey);
    // if (cached) {
    //   const keyWithUserId = `auth0:${cached.user_id}`;
    //   const userInfo = await this.cache.get<UserDTO>(keyWithUserId);
    //   if (userInfo) return userInfo;
    //   this.cache.del(cacheKey);
    // }
    return await userInfo
      .getUserInfo(accessToken)
      .then((res) => ({
        sub: res.data.sub,
        user_id: res.data.sub,
        email: res.data.email,
        name: res.data.name,
        picture: res.data.picture,
      }))
      .then((data) => {
        // if (data) {
        //   const ttlMs = 3600 * 1000; // 1 hour
        //   const keyWithUserId = `auth0:${data.user_id}`;
        //   this.cache.set(cacheKey, data, ttlMs);
        //   this.cache.set(keyWithUserId, data, ttlMs);
        // }
        return data;
      })
      .catch((err) => {
        if (err instanceof ResponseError) {
          console.error(err.headers.get('WWW-Authenticate'));
          if (err.statusCode === 401) return null;
        }
        throw err;
      });
  }
}
