const arrayToEnum = <T extends string, U extends [T, ...T[]]>(...args: U) => {
  return args.reduce(
    (acc, key) => {
      acc[key] = key;
      return acc;
    },
    {} as { [key in U[number]]: key },
  );
};

export type TEvent<TType extends string = string, TData = unknown> = {
  type: TType;
  data: TData;
};

export const EventType = arrayToEnum(
  'customer_planed',
  'customer_plan_created',
  'customer_plan_updated',
  'customer_plan_deleted',
);

export type EventTypes = keyof typeof EventType;

export type TCustomerPlaned = TEvent<
  typeof EventType.customer_planed,
  { customer_id: string; plan_id: string }
>;
export type TCustomerPlanCreated = TEvent<
  typeof EventType.customer_plan_created,
  { id: string; customer_id: string; plan_id: string }
>;
export type TCustomerPlanUpdated = TEvent<
  typeof EventType.customer_plan_updated,
  { id: string; customer_id: string; plan_id: string }
>;
export type TCustomerPlanDeleted = TEvent<
  typeof EventType.customer_plan_deleted,
  { id: string; customer_id: string; plan_id: string }
>;

export type TPaymentEvent =
  | TCustomerPlaned
  | TCustomerPlanCreated
  | TCustomerPlanUpdated
  | TCustomerPlanDeleted;

export class PaymentEvent<T extends TPaymentEvent = TPaymentEvent> {
  constructor(public event: T) {}

  get type() {
    return this.event.type;
  }

  get data() {
    return this.event.data;
  }

  get tuple() {
    return [this.type, this.data] as const;
  }
}
