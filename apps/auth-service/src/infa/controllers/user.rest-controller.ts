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
import * as rx from 'rxjs';

import { AUTH_SERVICE, AllowedPermission, Permissions } from 'lib/auth-client';

@Controller('users')
@UseGuards(AllowedPermission)
@Permissions('manage:users')
@ApiTags('users')
@ApiBearerAuth()
export class UserRestController {
  private readonly userService: any;

  constructor(@Inject(AUTH_SERVICE) private readonly client: any) {
    this.userService = this.client.getService('UserService');
  }

  @Get()
  list() {
    const users: any[] = [];
    const fetch: rx.Observable<any> = this.userService.list({});
    fetch.subscribe({
      next: ({ users }) => users.push(users),
      error: (err) => console.error(err),
      complete: () => users,
    });

    return fetch;
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