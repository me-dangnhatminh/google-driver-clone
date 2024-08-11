import { Injectable } from '@nestjs/common';

import { ManagementClient, UserInfoClient } from 'auth0';

export const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MANAGEMENT_ID,
  clientSecret: process.env.AUTH0_MANAGEMENT_SECRET,
});

export const userInfo = new UserInfoClient({
  domain: process.env.AUTH0_DOMAIN,
});

@Injectable()
export class AuthService {
  constructor() {}

  validateToken(accessToken: string) {
    // save in cache
    return userInfo
      .getUserInfo(accessToken)
      .then((res) => ({
        sub: res.data.sub,
        user_id: res.data.sub,
        email: res.data.email,
        name: res.data.name,
        picture: res.data.picture,
      }))
      .catch((err) => {
        console.error(err);
        return null;
      });
  }
}
