import { Controller, Get } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PlanedEvent } from '../adapters';

@Controller()
export class HTTPController {
  constructor(private readonly eventBus: EventBus) {}

  @Get()
  getHello(): string {
    const event = new PlanedEvent({ abc: 'Hello World!' });
    this.eventBus.publish(event);
    return 'Hello World!';
  }
}
