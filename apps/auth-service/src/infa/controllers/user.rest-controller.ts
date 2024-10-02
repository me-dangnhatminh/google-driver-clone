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
import z from 'zod';

const ListRequest = z
  .object({
    query: z
      .object({
        size: z.number().optional(),
        offset: z.string().optional(),
        sort: z.string().optional(),
        filter: z.record(z.string()).optional(),
      })
      .optional(),
  })
  .strict();
type ListRequest = z.infer<typeof ListRequest>;

const Response = z.object({
  data: z.record(z.unknown()),
  offset: z.string(),
  total: z.number(),
});

import { AllowedPermission, Permissions } from 'libs/auth-client';

@Controller('users')
@UseGuards(AllowedPermission)
@Permissions('manage:users')
@ApiTags('users')
@ApiBearerAuth()
export class UserRestController {
  constructor(@Inject('UserService') private readonly userService: any) {}

  @Get()
  list(request) {
    const AUTHENTICATE_USER_HEADER_NAME = 'x-authenticated-user';
    const user_id = request.headers['x-authenticated-user'];
    const user = this.userService.get({ id: user_id });

    const users: any[] = [];
    const fetch: rx.Observable<any> = this.userService.list({});
    fetch.subscribe({
      next: ({ users }) => users.push(users),
      error: (err) => console.error(err),
      complete: () => users,
    });

    return {
      data: {},
      offset: '0',
    };

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
