import { Controller, Get } from '@nestjs/common';
import { StorageService } from 'src/app';

@Controller()
export class HTTPController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  getHello() {
    return this.storageService.getHello();
  }
}
