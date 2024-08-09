import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller({ path: 'api', version: '1.0' })
@ApiTags('users')
@ApiBearerAuth()
export class HTTPController {
  constructor() {}

  @Get()
  getHello() {
    throw new Error('User Service, Hello World!');
    return 'User Service, Hello World!';
  }
}
