import { Injectable } from '@nestjs/common';

import {
  GetUsers200ResponseOneOfInner,
  ManagementClient,
  UserInfoClient,
} from 'auth0';

export const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MANAGEMENT_ID,
  clientSecret: process.env.AUTH0_MANAGEMENT_SECRET,
});

export const userInfo = new UserInfoClient({
  domain: process.env.AUTH0_DOMAIN,
});

@Injectable()
export class UserService {
  constructor() {}

  async validate(token: string) {
    return userInfo.getUserInfo(token).then((res) => res.data);
  }

  async getAll(): Promise<any> {
    return await management.users.getAll();
  }

  async listUsers(ids: string[]): Promise<
    Array<{
      user_id: string;
      email: string;
      name: string;
      picture: string;
    }>
  > {
    if (ids.length === 0) return [];

    const allUsers: GetUsers200ResponseOneOfInner[] = [];
    const queryIds = ids.map((id) => `user_id:${id}`).join(' OR ');
    let page = 0;
    while (true) {
      const {
        data: { users, total },
      } = await management.users.getAll({
        include_totals: true,
        page: page++,
        q: queryIds,
      });
      allUsers.push(...users);
      if (allUsers.length === total) break;
    }

    return allUsers
      .filter((user) => ids.includes(user.user_id))
      .map((user) => ({
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      }));
  }
}
