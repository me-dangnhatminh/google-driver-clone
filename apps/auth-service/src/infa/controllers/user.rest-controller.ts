import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, Authenticated, Roles } from '@app/auth-client';

@Controller({ path: 'users', version: '1' })
@UseGuards(Authenticated, AllowedRoles)
@Roles('admin')
@ApiTags('users')
@ApiBearerAuth()
export class UserRestController {
  constructor(@Inject('UserService') private readonly userService) {}

  @Get()
  list() {
    return [{ id: '1', name: 'John Doe' }];
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.userService.get({ id }).toPromise();
  }
}
