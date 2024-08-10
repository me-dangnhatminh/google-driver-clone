export type IEvent<TName extends string = string, TPayload = unknown> = {
  id: string;
  name: TName;
  timestamp: number;
  payload: TPayload;
};

export type PlanedPayload = PaymentEvent['payload'];
export type PlanedEvent = IEvent<
  'planed',
  {
    name: string;
    planId: string;
    amount: number;
  }
>;

export type PaymentEvent = PlanedEvent;
