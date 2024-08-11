import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class RootController {
  constructor() {}

  @Get()
  getHello(@Req() req: Request) {
    if (!req.oidc.isAuthenticated()) {
      return { message: 'Hello World!, Please login' };
    }
    if (req.oidc.user) {
      return {
        user: req.oidc.user,
        access_token: req.oidc.accessToken.access_token,
      };
    }
  }
}
