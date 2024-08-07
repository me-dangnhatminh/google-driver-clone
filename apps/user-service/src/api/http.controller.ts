import { Controller, Get } from '@nestjs/common';

@Controller({ path: 'api' })
export class HTTPController {
  constructor() {}

  @Get()
  getHello() {
    return 'User Service, Hello World!';
  }
}
