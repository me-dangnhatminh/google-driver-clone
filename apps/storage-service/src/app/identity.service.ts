import { Logger } from '@nestjs/common';

export class IdentityService {
  private logger = new Logger(IdentityService.name);

  constructor() {}

  async validateToken(token: string) {
    // this.logger.log(`validateToken: ${token}`);
    return { token };
  }
}
