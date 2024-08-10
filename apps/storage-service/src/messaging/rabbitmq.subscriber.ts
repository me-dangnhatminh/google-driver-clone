import { IEvent, IMessageSource } from '@nestjs/cqrs';
import { Subject } from 'rxjs';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';

import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitMQSubscriber implements IMessageSource {
  private bridge: Subject<any>;

  constructor(
    private readonly amqp: AmqpConnection,
    private readonly events: Array<new (data: any) => IEvent>,
  ) {}

  connect() {
    this.events.forEach((event) => {
      this.amqp.createSubscriber<string>(
        async (message) => {
          if (this.bridge) {
            const parsedJson = JSON.parse(message);
            const receivedEvent = new event(parsedJson);
            this.bridge.next(receivedEvent);
            return new Nack(false);
          }
        },
        {
          errorHandler: (channel, msg, e) => {
            throw e;
          },
          queue: event.name,
        },
        `handler_${event.name}`,
      );
    });
  }

  bridgeEventsTo<T extends IEvent>(subject: Subject<T>): any {
    this.bridge = subject;
  }
}
