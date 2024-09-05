import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
export class UserRESTController {
  private readonly userService: any;

  constructor(@Inject('IDENTITY_SERVICE') private readonly client: ClientGrpc) {
    this.userService = this.client.getService<any>('UserService');
  }

  @Get()
  list() {
    return this.userService.list({});
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.userService.getById({ id });
  }

  @Post()
  create(@Body() body: any) {
    return this.userService.create({
      name: body.name,
      email: body.email,
      password: body.password,
    });
  }
}
