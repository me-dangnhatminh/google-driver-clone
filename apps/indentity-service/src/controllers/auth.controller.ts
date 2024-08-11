import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { AuthService } from 'src/services/auth.service';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ======================
  @MessagePattern('validateToken', Transport.RMQ)
  validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
}
