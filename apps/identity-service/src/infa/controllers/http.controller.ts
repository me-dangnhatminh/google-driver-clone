import { Controller, Get, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Users')
export class HttpController {
  private readonly userService: any;
  constructor(@Inject('IDENTITY_SERVICE') private readonly client: ClientGrpc) {
    this.userService = this.client.getService<any>('IUserService');
  }

  @Get()
  async list() {
    const res = await this.userService.getById({ id: '1' });
    return res;
  }
}
