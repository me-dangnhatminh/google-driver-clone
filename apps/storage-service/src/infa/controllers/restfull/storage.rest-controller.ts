import { Controller, Get, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('storage')
@ApiBearerAuth()
@Controller({ path: 'storage', version: '1' })
export class StorageRestController {
  constructor(@Inject('StorageService') private readonly storageService) {}

  @Get()
  async list() {
    return await this.storageService.list();
  }

  @Get(':id')
  async get(id: string) {
    return await this.storageService.get(id);
  }

  @Get(':id/content')
  async getContent(id: string) {
    return await this.storageService.getContent(id);
  }

  @Get(':id/download')
  async download(id: string) {
    return await this.storageService.download(id);
  }
}
