import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  constructor() {}

  getHello(): string {
    return 'Hello World!';
  }

  getMyStorage(ownerId: string) {
    return {
      ownerId,
      rootId: 'root',
      folders: [],
      files: [],
    };
  }
}
