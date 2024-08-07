export type PlanedPayload = {
  name: string;
  planId: string;
  amount: number;
};

export type PlanedEvent = {
  name: 'planed';
  id: string;
  timestamp: number;
  payload: PlanedPayload;
};

export type PaymentEvent = PlanedEvent;
