import { Injectable } from '@nestjs/common';
import { ManagementClient, UserInfoClient } from 'auth0';
import { UserEntity } from 'src/domain';

@Injectable()
export class UserService {
  constructor(
    private readonly userInfo: UserInfoClient,
    private readonly userManagement: ManagementClient,
  ) {}

  async get(input: { id: string }) {
    const id = input.id;

    const user = await Promise.all([
      this.userManagement.users
        .getRoles({ id })
        .then((rs) => rs.data)
        .then((rs) => rs.map((r) => r.name)),
      this.userManagement.users
        .getPermissions({ id })
        .then((rs) => rs.data)
        .then((rs) => rs.map((r) => r.permission_name)),
      this.userManagement.users.get({ id }).then(({ data }) => ({
        id: data.user_id,
        name: data.name,
        email: data.email,
        metadata: data.app_metadata,
        email_verified: data.email_verified,
      })),
    ])
      .then(([roles, permissions, user]) => ({ ...user, roles, permissions }))
      .then(UserEntity.new);
    return user.props;
  }
}
