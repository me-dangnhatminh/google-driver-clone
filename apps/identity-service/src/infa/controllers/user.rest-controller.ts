import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthorizedGuard, PermissionGuard, Permissions } from 'src/infa/guards';

@Controller('users')
@Permissions('manage:users')
@UseGuards(AuthorizedGuard, PermissionGuard)
@ApiTags('users')
@ApiBearerAuth()
export class UserRESTController {
  private readonly userService: any;

  constructor(@Inject('GRPC_CLIENT_SERVICE') private readonly client: any) {
    this.userService = this.client.getService('UserService');
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
