import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import * as rx from 'rxjs';

export class UserDTO {
  sub: string;
  user_id: string;
  email: string;
  name: string;
  picture: string;
}

export class TokenValidateCommand {
  public readonly name = 'validateToken' as const;
  constructor(public readonly data: { token: string }) {}
  get tuple(): [typeof this.name, typeof this.data] {
    return [this.name, this.data];
  }
}

@Injectable()
export class IdentityService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
  ) {}

  @EventPattern('token_updated')
  tokenUpdatedEvent(@Payload() data) {
    this.cache.del(`auth0:${data.token}`);
  }

  async validateToken(accessToken: string) {
    const cacheKey = `auth0:${accessToken}`;
    const cached = await this.cache.get<UserDTO | null>(cacheKey);
    if (cached) return cached;
    const cmd = new TokenValidateCommand({ token: accessToken });
    const send = this.identityClient.send<UserDTO | null>(...cmd.tuple);
    return rx.firstValueFrom(send).then((data) => {
      if (data) {
        const ttlMs = 60 * 60 * 1000;
        this.cache.set(cacheKey, data, ttlMs);
      }
      return data;
    });
  }
}
