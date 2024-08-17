import { Controller, Get } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

@Controller('/users')
export class HttpController {
  constructor(private client: ClientGrpc) {}

  @Get()
  async createUser(data) {
    const identityService = this.client.getService<any>('AuthService');
    return identityService.createUser(data).toPromise();
  }
}
