import { Controller, Get, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Users')
export class HttpController {
  private readonly userService: any;

  constructor(@Inject('IDENTITY_SERVICE') private readonly client: ClientGrpc) {
    this.userService = this.client.getService<any>('UserService');
  }

  @Get()
  list() {
    return this.userService.list({});
  }
}
