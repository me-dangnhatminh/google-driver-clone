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

  connect() {
    this.amqp.createSubscriber<string>(
      async (message) => {
        if (this.subject$) {
          const parsedJson = JSON.parse(message);
          console.log('RabbitMQSubscriber', parsedJson);
        }
      },
      {
        errorHandler: (channel, msg, e) => {
          throw e;
        },
        queue: 'storage-service',
      },
      `handler_storage-service`,
    );
  }

  bridgeEventsTo<T extends EventBase>(subject: Subject<T>) {
    this.subject$ = subject;
    this.connect();
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
    const exchange = '';
    const eventName = event['name'] ?? event.constructor.name; // TODO: fix

    const message = JSON.stringify(event);
    return this.amqpConnection
      .publish(exchange, eventName, message)
      .then(() => {
        console.log('RabbitMQPublisher', event);
        this.subject$.next(event);
      });
  }

  bridgeEventsTo<T extends EventBase>(subject: Subject<T>) {
    this.subject$ = subject;
  }
}

export class PlanedEvent implements IEvent {
  constructor(
    public readonly payload: any,
    public readonly name: string = 'planed',
  ) {
    this.constructor.prototype.name = name;
  }
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
