export * from 'auth0';
import { Injectable, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserInfoClient, ManagementClient } from 'auth0';
import * as jwksClient from 'jwks-rsa';

export const wwwAuthToJson = (wwwAuth: string) => {
  const parts = wwwAuth.split(',');
  const detail: any = {};
  parts.forEach((part) => {
    const [key, value] = part.split('=');
    detail[key.trim()] = value.replace(/"/g, '');
  });
  return detail;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly jwksClient: jwksClient.JwksClient;
  constructor(
    readonly configService: ConfigService,
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

  async verifyToken(token: string) {
    const decoded = this.jwtService.decode(token, { complete: true });
    if (!decoded) throw new Error('Invalid token');
    const header = decoded.header;
    const kid = header.kid;
    const key = await this.jwksClient.getSigningKey(kid);
    const signingKey = key.getPublicKey();
    return await this.jwtService
      .verifyAsync(token, {
        algorithms: ['RS256'],
        publicKey: signingKey,
      })
      .then((res) => {
        if (!res['x_metadata']) {
          this.logger.warn(`No "x_metadata" found in token claims`);
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
          metadata: res['x_metadata'],
        };
      });
  }
}

@Module({
  imports: [JwtModule.register({})],
  providers: [
    AuthService,
    {
      provide: UserInfoClient,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const domain = configService.getOrThrow('AUTH0_DOMAIN');
        return new UserInfoClient({ domain });
      },
    },
    {
      provide: ManagementClient,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const domain = configService.getOrThrow('AUTH0_DOMAIN');
        const clientId = configService.getOrThrow('AUTH0_CLIENT_ID');
        const clientSecret = configService.getOrThrow('AUTH0_CLIENT_SECRET');
        return new ManagementClient({
          domain,
          clientId,
          clientSecret,
        });
      },
    },
  ],
  exports: [UserInfoClient, ManagementClient, AuthService],
})
export class Auth0Module {}
