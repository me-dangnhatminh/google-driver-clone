import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  constructor() {}

  getHello(): string {
    return 'Hello World!';
  }
}
