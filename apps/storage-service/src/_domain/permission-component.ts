import { PermissionVO } from './permission';
import { UserEntity } from './user.entity';

interface IPermissionComponent {
  getPermissions(): PermissionVO[];
}

export class UserPermission implements IPermissionComponent {
  public user: string | UserEntity;
  public permissions: PermissionVO[];

  constructor(user: string | UserEntity, permissions: PermissionVO[]) {
    this.user = user;
    this.permissions = permissions;
  }

  getPermissions() {
    return this.permissions;
  }
}

export class GroupPermission implements IPermissionComponent {
  private users: IPermissionComponent[] = [];

  addUser(user: IPermissionComponent) {
    this.users.push(user);
  }

  getPermissions(): PermissionVO[] {
    return this.users.flatMap((user) => user.getPermissions());
  }
}
