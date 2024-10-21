import { randomUUID as uuid } from 'crypto';
import { UserEntity, Profile } from './entities';

export abstract class UserCreator extends UserEntity {
  static create(props: Profile) {
    return new UserEntity({
      ...props,
      id: uuid(),
      roles: [],
      permissions: [],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}
