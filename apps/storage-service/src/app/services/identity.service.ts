import { Logger } from '@nestjs/common';

export class IdentityService {
  private logger = new Logger(IdentityService.name);
  constructor() {}
}
