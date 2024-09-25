export type IEvent<TType extends string = string, TPayload = unknown> = {
  type: TType;
  payload: TPayload;
};

export type IPlanedEvent = IEvent<
  'planed',
  {
    name: string;
    planId: string;
    amount: number;
  }
>;

export type IPaymentEvent = IPlanedEvent;

export class PaymentEvent<TE extends IPaymentEvent = IPaymentEvent> {
  constructor(public event: TE) {}

  get type() {
    return this.event.type;
  }

  get payload() {
    return this.event.payload;
  }

  get tuple() {
    return [this.type, this.payload] as const;
  }
}

export class PlanedEvent extends PaymentEvent<IPlanedEvent> {}
