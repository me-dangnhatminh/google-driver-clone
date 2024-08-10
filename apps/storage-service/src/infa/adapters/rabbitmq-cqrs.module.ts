import {
  CqrsModule,
  EventBus,
  IEvent,
  IEventPublisher,
  IMessageSource,
  EventsHandler,
  IEventHandler,
} from '@nestjs/cqrs';
import { Subject } from 'rxjs';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { Injectable, Module, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RabbitMQSubscriber<EventBase extends IEvent = IEvent>
  implements IMessageSource<EventBase>
{
  constructor(
    private subject$: Subject<EventBase>,
    private readonly amqp: AmqpConnection,
  ) {}

  bridgeEventsTo<T extends EventBase>(subject: Subject<T>) {
    this.subject$ = subject;
  }
}

@Injectable()
export class RabbitMQPublisher<EventBase extends IEvent = IEvent>
  implements IEventPublisher<EventBase>, IMessageSource<EventBase>
{
  constructor(
    private subject$: Subject<EventBase>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  publish<T extends EventBase>(event: T) {
    const eventName = event['name'] ?? event.constructor.name; // TODO: fix
    return this.amqpConnection.publish('', eventName, event).then(() => {
      console.log('RabbitMQPublisher', event);
      this.subject$.next(event);
    });
  }

  bridgeEventsTo<T extends EventBase>(subject: Subject<T>) {
    this.subject$ = subject;
  }
}

export class PlanedEvent implements IEvent {
  public readonly name: string = 'planed';
  constructor(public readonly payload: any) {}
}

@EventsHandler(PlanedEvent)
export class PlanedEventHandled implements IEventHandler<PlanedEvent> {
  handle(event: PlanedEvent) {
    console.log('PlanedEventHandled', event);
  }
}

@Module({
  imports: [
    CqrsModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: 'amqp://localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [PlanedEventHandled],
  exports: [CqrsModule],
})
export class RabbitCQRSModule implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async onModuleInit(): Promise<any> {
    this.amqpConnection.init();
    const subject = this.eventBus.subject$;

    const publisher = new RabbitMQPublisher(subject, this.amqpConnection);
    this.eventBus.publisher = publisher;
  }
}
