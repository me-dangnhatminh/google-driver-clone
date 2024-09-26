export type TEvent<TType extends string = string, TData = unknown> = {
  type: TType;
  data: TData;
};

export type TPlanedEvent = TEvent<
  'planed',
  {
    name: string;
    planId: string;
    amount: number;
  }
>;

export type TPaymentEvent = TPlanedEvent;

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

export class PlanedEvent extends PaymentEvent<TPaymentEvent> {}
