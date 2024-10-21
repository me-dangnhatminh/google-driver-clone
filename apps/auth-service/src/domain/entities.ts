import z from 'zod';
import { ISOString, Metadata, Permissions, Roles } from './value-objects';

export type Profile = z.infer<typeof ProfileSchema>;
export type UniqueUser = z.infer<typeof UniqueUser>;
export type User = z.infer<typeof UserSchema>;

export const ProfileSchema = z.object({
  name: z.string(),
  email_verified: z.boolean(),
  email: z.string(),
  picture: z.string().optional(),
});

export const UniqueUser = z.object({
  id: z.string(),
  roles: Roles,
  permissions: Permissions,
  metadata: Metadata,
  created_at: ISOString.optional(),
  updated_at: ISOString.optional(),
  deleted_at: ISOString.optional(),
});
export const UserSchema = ProfileSchema.merge(UniqueUser);

export class UserEntity {
  protected _props: User;
  protected constructor(data: User | UserEntity) {
    if (data instanceof UserEntity) data = data.props;
    this._props = UserSchema.parse(data);
  }

  static new(data: User | UserEntity) {
    return new UserEntity(data);
  }

  get props() {
    return this._props;
  }

  get deleted() {
    return this._props.deleted_at !== undefined;
  }

  updateProfile(profile: Partial<Profile>) {
    if (this.deleted) throw new Error('Cannot update a deleted user');
    const valid = ProfileSchema.parse(profile);
    this._props = Object.assign(this._props, valid);
    return this;
  }

  remove() {
    this._props.deleted_at = new Date().toISOString();
    return this;
  }

  restore() {
    this._props.deleted_at = undefined;
    return this;
  }

  toJSON() {
    return structuredClone(this._props);
  }
}

export class AdminUser extends UserEntity {
  constructor(data: User) {
    super(data);
    if (!this._props.roles.includes('admin')) {
      throw new Error('Admin user must have admin role');
    }
  }

  deleteUsers(users: UserEntity[]) {
    if (this.deleted) {
      throw new Error('Cannot delete users with a deleted user');
    }
    users.forEach((user) => user.remove());
    return this;
  }

  restoreUsers(users: UserEntity[]) {
    if (this.deleted) {
      throw new Error('Cannot restore users with a deleted user');
    }
    users.forEach((user) => user.restore());
    return this;
  }
}

export default {};
