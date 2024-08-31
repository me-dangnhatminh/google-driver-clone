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
  async createUser() {
    const authService = this.client.getService<any>('IUserService');
    return await authService.getById('1');
  }
}
