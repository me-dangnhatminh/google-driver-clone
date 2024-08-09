import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class TCPController {
  constructor() {}

  @MessagePattern({ cmd: 'hello' })
  getHello() {
    return 'User Service, Hello World!';
  }
}
