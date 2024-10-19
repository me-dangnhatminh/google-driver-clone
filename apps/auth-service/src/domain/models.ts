import z from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  picture: z.string().optional(),
  roles: z.string().array(),
  permissions: z.string().array(),
  metadata: z.record(z.unknown()),

  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
});
export type UserSchema = z.infer<typeof UserSchema>;
export class User {
  private _props: UserSchema;
  constructor(props: UserSchema | User) {
    let valid: UserSchema;
    if (props instanceof User) valid = UserSchema.parse(props.props);
    else valid = UserSchema.parse(props);
    this._props = valid;
  }

  get props() {
    return this._props;
  }
}

export default {};
