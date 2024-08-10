import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  constructor() {}

  async getHello() {
    return 'Hello World!';
  }
}
