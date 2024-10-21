import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserInfoClient } from 'auth0';
import * as jwksClient from 'jwks-rsa';
import { UserEntity } from 'src/domain';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwksClient: jwksClient.JwksClient;

  constructor(
    readonly configService: ConfigService,
    private readonly userInfo: UserInfoClient,
    private readonly jwtService: JwtService,
  ) {
    const domain = configService.getOrThrow('AUTH0_DOMAIN');
    const jwksUri = `https://${domain}/.well-known/jwks.json`;
    this.jwksClient = jwksClient({
      jwksUri,
      cache: true,
      cacheMaxAge: 24 * 60 * 60 * 1000, // 24 hours
      requestHeaders: { 'User-Agent': 'auth-service' },
    });
  }

  async validate(input: { token: string }) {
    const token = input.token;
    const user = await this.userInfo
      .getUserInfo(token)
      .then(({ data }) => data)
      .then((user) => {
        return {
          ...user,
          id: user.sub,
          roles: [],
          permissions: [],
          metadata: Object.assign({}, user.custom_metadata),
        };
      })
      .then(UserEntity.new);
    return user.props;
  }

  async verify(input: { token: string }) {
    const token = input.token;
    const decoded = this.jwtService.decode(token, { complete: true });
    if (!decoded) throw new Error('Invalid token');
    const header = decoded.header;
    const kid = header.kid;
    const key = await this.jwksClient.getSigningKey(kid);
    const signingKey = key.getPublicKey();
    const result = await this.jwtService
      .verifyAsync(token, { algorithms: ['RS256'], publicKey: signingKey })
      .then((res) => {
        if (!res['custom_metadata']) {
          this.logger.warn(`No "custom_metadata" found in token claims`);
        }
        return {
          iss: res.iss,
          sub: res.sub,
          aud: res.aud,
          iat: res.iat,
          exp: res.exp,
          scope: res.scope,
          azp: res.azp,
          permissions: res.permissions,
          metadata: res['custom_metadata'] ?? {},
        };
      });
    return result;
  }
}
