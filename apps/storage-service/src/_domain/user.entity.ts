import z from 'zod';

export const UserSchame = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  picture: z.string().optional(),
});
export type UserSchame = z.infer<typeof UserSchame>;
export class UserEntity {
  protected _props: UserSchame;
  constructor(props: UserSchame) {
    this._props = UserSchame.parse(props);
  }
}
