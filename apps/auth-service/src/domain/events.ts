import { util } from 'zod';
export type TEvent<TType extends string = string, TData = unknown> = {
  type: TType;
  data: TData;
};

export const UserEventType = util.arrayToEnum(['user_created']);
export type UserEventTypes = keyof typeof UserEventType;

export type TUserCreated = TEvent<
  typeof UserEventType.user_created,
  {
    id: string;
    email: string;
    name: string;
    created: number;
    updated: number;
  }
>;

export type TUserEvent = TUserCreated;

export class UserEvent<T extends TUserEvent> {
  constructor(public event: T) {}

  get type() {
    return this.event.type;
  }

  get data() {
    return this.event.data;
  }

  tuple() {
    return [this.type, this.data] as const;
  }
}

export class UserCreatedEvent extends UserEvent<TUserCreated> {
  constructor(data: TUserCreated['data']) {
    super({ type: UserEventType.user_created, data });
  }
}
