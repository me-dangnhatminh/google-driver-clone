import { Injectable } from '@nestjs/common';
import { IEventPublisher } from '@nestjs/cqrs';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

const SERVICE_NAME = 'storage-service';

@Injectable()
export class RabbitMQPublisher implements IEventPublisher {
  private readonly client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: SERVICE_NAME,
        queueOptions: { durable: false },
        noAck: false,
      },
    });
  }

  connect(): void {
    this.client.connect();
  }

  publish<T>(event: T): any {
    return this.client.emit(SERVICE_NAME, event);
  }
}
