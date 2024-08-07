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
    this.userService.send({ cmd: 'hello' }, '').subscribe((res) => {
      console.log(res);
    });
    return this.appService.getHello();
  }
}
