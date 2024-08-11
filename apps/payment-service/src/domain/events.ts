export type IEvent<TName extends string = string, TPayload = unknown> = {
  // id: string;
  // timestamp: number;
  name: TName;
  payload: TPayload;
};

export type IPlanedPayload = {
  name: string;
  planId: string;
  amount: number;
};
export type IPlanedEvent = IEvent<'planed', IPlanedPayload>;

export class PlanedEvent implements IPlanedEvent {
  public readonly name = 'planed';
  public readonly payload: IPlanedPayload;
  constructor(payload: IPlanedPayload) {
    this.payload = payload;
  }

  get tuple() {
    return [this.name, this.payload] as const;
  }
}

export type PaymentEvent = PlanedEvent;
