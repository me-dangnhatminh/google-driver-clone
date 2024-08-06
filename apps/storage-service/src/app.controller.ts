import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    this.userService.emit('hello', 'Hello from Storage');
    return this.appService.getHello();
  }
}
