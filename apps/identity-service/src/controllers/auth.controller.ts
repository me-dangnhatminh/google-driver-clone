import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { AuthService } from 'src/services/auth.service';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ======================
  @GrpcMethod('AuthService', 'ValidateToken')
  validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
}
