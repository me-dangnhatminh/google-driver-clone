import { Controller, Get, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Users')
export class HttpController {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly client: ClientGrpc,
  ) {}

  @Get()
  async list() {
    const userService = this.client.getService<any>('IUserService');
    const users = await userService
      .list({
        cursor: '1',
        limit: 10,
      })
      .toPromise();
    return users;
  }
}
