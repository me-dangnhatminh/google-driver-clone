import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('storage')
@ApiBearerAuth()
@Controller({ path: 'storage', version: '1' })
export class StorageRestController {
  constructor() {}

  @Get('my')
  async my() {
    return {
      name: 'My storage',
      used: 0,
      limit: 100 * 1024 * 1024, // 100MB
    };
  }
}
