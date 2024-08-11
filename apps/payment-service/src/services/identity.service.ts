import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as rx from 'rxjs';

export class UserDTO {
  sub: string;
  user_id: string;
  email: string;
  name: string;
  picture: string;
}

export class TokenValidateCommand {
  name: 'validateToken';
  constructor(public data: { token: string }) {}
}

@Injectable()
export class IdentityService {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityService: ClientProxy,
  ) {}

  validateToken(accessToken: string) {
    const cmd = new TokenValidateCommand({ token: accessToken });
    return rx.firstValueFrom(this.identityService.send(cmd.name, cmd.data));
  }
}
