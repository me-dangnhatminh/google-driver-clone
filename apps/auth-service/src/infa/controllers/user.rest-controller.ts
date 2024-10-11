import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, Authenticated, Roles } from '@app/auth-client';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller({ path: 'users', version: '1' })
@UseGuards(Authenticated, AllowedRoles)
@Roles('admin')
@ApiTags('users')
@ApiBearerAuth()
export class UserRestController {
  constructor(@Inject('UserService') private readonly userService) {}

  @Get()
  @CacheKey('users')
  @CacheTTL(1 * 60 * 1000)
  list() {
    console.log('list');
    return [{ id: '1', name: 'John Doe' }];
  }

  @Get(':id')
  @CacheKey('user')
  @CacheTTL(60 * 60 * 1000) // 1 hour
  get(@Param('id') id: string) {
    return this.userService.get({ id }).toPromise();
  }
}
