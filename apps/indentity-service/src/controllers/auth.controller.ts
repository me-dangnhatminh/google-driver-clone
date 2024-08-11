import { Controller, Get, Req } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Request } from 'express';
import { AuthService } from 'src/services/auth.service';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ======================
  @MessagePattern({ cmd: 'validateToken' })
  validateToken(data) {
    return this.authService.validateToken(data.token);
  }

  // ======================
  @Get()
  getHello(@Req() req: Request) {
    if (!req.oidc.isAuthenticated()) {
      return { isAuthenticated: false };
    }
    return {
      user: req.oidc.user,
      token: req.oidc.accessToken,
    };
  }
}
